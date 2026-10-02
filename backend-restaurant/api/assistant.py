import math
import re
import unicodedata
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from db import get_db
from models.expense import Expense
from models.revenue import Revenue
from repositories import revenue_repo
from schemas.assistant import AssistantChatRequest, AssistantConfirmRequest
from services import expense_service, revenue_service
from services.finance_assistant import (
    FinanceAssistantError,
    ask_finance_assistant,
)

router = APIRouter(prefix="/api/assistant", tags=["finance-assistant"])
EXPENSE_KEYS = ("ha", "gao", "cho", "kho", "gas", "dau", "trung", "hop", "luong", "ga", "khac")
REVENUE_KEYS = ("tien_mat", "chuyen_khoan")
MAX_AMOUNT = 1_000_000_000_000
EVIDENCE_TERMS = {
    "ha": ("tien nha", "thue nha"),
    "gao": ("tien gao", "gao"),
    "cho": ("tien cho", "cho"),
    "kho": ("tien kho", "kho"),
    "gas": ("tien gas", "gas"),
    "dau": ("tien dau", "dau"),
    "trung": ("tien trung", "trung"),
    "hop": ("tien hop", "hop"),
    "luong": ("tien luong", "luong"),
    "ga": ("tien ga", "ga"),
    "khac": ("tien khac", "khac"),
    "tien_mat": ("tien mat",),
    "chuyen_khoan": ("chuyen khoan", "ck"),
}


def _normalize(value):
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn").replace("đ", "d").lower()


def _evidence_date(evidence, today):
    normalized = _normalize(evidence)
    if "hom nay" in normalized:
        return today
    if "hom qua" in normalized:
        return today - timedelta(days=1)
    if "hom kia" in normalized:
        return today - timedelta(days=2)
    if "ngay mai" in normalized:
        return today + timedelta(days=1)
    if "ngay kia" in normalized:
        return today + timedelta(days=2)

    iso_match = re.search(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b", normalized)
    if iso_match:
        year, month, day = map(int, iso_match.groups())
        try:
            return date(year, month, day)
        except ValueError:
            return None

    named_match = re.search(
        r"\b(?:ngay\s+)?(\d{1,2})\s+thang\s+(\d{1,2})(?:\s+nam\s+(\d{4}))?\b",
        normalized,
    )
    numeric_match = re.search(
        r"\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{4}))?\b", normalized
    )
    match = named_match or numeric_match
    if not match:
        return None
    if named_match:
        day, month, year = match.groups()
    else:
        day, month, year = match.groups()
    try:
        return date(int(year or today.year), int(month), int(day))
    except ValueError:
        return None


def _parse_amount_evidence(evidence):
    normalized = _normalize(evidence).replace(" ", "")
    match = re.search(r"(\d[\d.,]*)(trieu|tr|nghin|ngan|k)?", normalized)
    if not match:
        return None

    raw, unit = match.groups()
    separators = [index for index, char in enumerate(raw) if char in ".,"]
    if separators:
        last = separators[-1]
        decimal_length = len(raw) - last - 1
        if decimal_length == 3 or len(separators) > 1:
            normalized_number = raw.replace(".", "").replace(",", "")
        else:
            normalized_number = raw[:last].replace(".", "").replace(",", "") + "." + raw[last + 1:]
    else:
        normalized_number = raw

    try:
        amount = float(normalized_number)
    except ValueError:
        return None
    if unit in ("k", "nghin", "ngan"):
        amount *= 1000
    elif unit in ("tr", "trieu"):
        amount *= 1_000_000
    if not math.isfinite(amount) or amount < 0 or amount > MAX_AMOUNT:
        return None
    return amount


def _validate_model_draft(raw_draft, user_text, today):
    if not isinstance(raw_draft, dict):
        return None
    kind = raw_draft.get("kind")
    if kind not in ("expense", "revenue"):
        return None

    date_evidence = raw_draft.get("date_evidence")
    if not isinstance(date_evidence, str) or _normalize(date_evidence) not in _normalize(user_text):
        return None
    verified_date = _evidence_date(date_evidence, today)
    if verified_date is None or raw_draft.get("date") != verified_date.isoformat():
        return None

    allowed_keys = EXPENSE_KEYS if kind == "expense" else REVENUE_KEYS
    raw_values = raw_draft.get("values")
    raw_evidence = raw_draft.get("value_evidence")
    if not isinstance(raw_values, dict) or not isinstance(raw_evidence, dict):
        return None
    if set(raw_values) - set(allowed_keys) or set(raw_evidence) - set(allowed_keys):
        return None

    values = {key: 0.0 for key in allowed_keys}
    for key, raw_value in raw_values.items():
        if isinstance(raw_value, bool) or not isinstance(raw_value, (int, float)):
            return None
        amount = float(raw_value)
        if not math.isfinite(amount) or amount < 0 or amount > MAX_AMOUNT:
            return None
        if amount == 0:
            continue
        evidence = raw_evidence.get(key)
        if not isinstance(evidence, str) or _normalize(evidence) not in _normalize(user_text):
            return None
        normalized_evidence = _normalize(evidence)
        if not any(
            re.search(rf"\b{re.escape(term)}\b", normalized_evidence)
            for term in EVIDENCE_TERMS[key]
        ):
            return None
        verified_amount = _parse_amount_evidence(evidence)
        if verified_amount is None or not math.isclose(amount, verified_amount, rel_tol=1e-9):
            return None
        values[key] = amount

    if not any(amount > 0 for amount in values.values()):
        return None

    return {"kind": kind, "date": verified_date.isoformat(), "values": values}


def _read_finance_context(db, today):
    start_date = today - timedelta(days=89)
    expenses = (
        db.query(Expense)
        .filter(Expense.date >= start_date, Expense.date <= today)
        .order_by(Expense.date)
        .all()
    )
    revenues = (
        db.query(Revenue)
        .filter(Revenue.date >= start_date, Revenue.date <= today)
        .order_by(Revenue.date)
        .all()
    )
    return {
        "coverage": {"from": start_date.isoformat(), "through": today.isoformat()},
        "expenses": [
            {"date": row.date.isoformat(), "total_vnd": float(row.amount or 0)}
            for row in expenses
        ],
        "revenues": [
            {
                "date": row.date.isoformat(),
                "cash_vnd": float(row.tien_mat or 0),
                "transfer_vnd": float(row.chuyen_khoan or 0),
                "total_vnd": float(row.total or 0),
            }
            for row in revenues
        ],
    }


@router.post("/chat")
async def chat_with_finance_assistant(
    payload: AssistantChatRequest,
    db: Session = Depends(get_db),
):
    if not payload.messages or payload.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="Tin nhắn cuối phải là câu hỏi của người dùng.")
    if len(payload.messages) > 24:
        raise HTTPException(status_code=422, detail="Hội thoại quá dài; hãy bắt đầu cuộc trò chuyện mới.")

    try:
        context = _read_finance_context(db, payload.today)
        result = await ask_finance_assistant(
            payload.messages[-20:], payload.today, context
        )
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Không thể đọc dữ liệu tài chính để trả lời lúc này.",
        ) from error
    except FinanceAssistantError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    reply = result.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        reply = "Bạn có thể nói rõ hơn để mình hỗ trợ chính xác nhé."
    user_text = " ".join(message.content for message in payload.messages if message.role == "user")
    draft = _validate_model_draft(result.get("draft"), user_text, payload.today)
    if result.get("draft") is not None and draft is None:
        return {
            "reply": "Mình chưa xác minh chắc chắn ngày hoặc số tiền từ nội dung bạn gửi. Bạn ghi rõ ngày và từng khoản tiền giúp mình nhé.",
            "draft": None,
        }

    if draft and draft["kind"] == "revenue":
        existing = revenue_repo.get_revenue_by_date(db, date.fromisoformat(draft["date"]))
        if existing:
            draft["existing"] = {
                "id": existing.id,
                "tien_mat": float(existing.tien_mat or 0),
                "chuyen_khoan": float(existing.chuyen_khoan or 0),
                "total": float(existing.total or 0),
            }
    return {"reply": reply.strip(), "draft": draft}


@router.post("/confirm")
def confirm_finance_draft(
    payload: AssistantConfirmRequest,
    db: Session = Depends(get_db),
):
    if not payload.confirmed:
        raise HTTPException(status_code=400, detail="Cần xác nhận trước khi lưu dữ liệu.")

    allowed_keys = EXPENSE_KEYS if payload.kind == "expense" else REVENUE_KEYS
    if set(payload.values) - set(allowed_keys):
        raise HTTPException(status_code=422, detail="Bản nháp chứa hạng mục không hợp lệ.")
    values = {key: 0.0 for key in allowed_keys}
    for key, amount in payload.values.items():
        if not math.isfinite(amount) or amount < 0 or amount > MAX_AMOUNT:
            raise HTTPException(status_code=422, detail=f"Số tiền {key} không hợp lệ.")
        values[key] = amount
    if not any(amount > 0 for amount in values.values()):
        raise HTTPException(status_code=422, detail="Bản nháp phải có ít nhất một khoản lớn hơn 0.")

    if payload.kind == "expense":
        record = expense_service.add_expense_item(
            db, {"date": payload.date, **values}
        )
        return {
            "status": "saved",
            "kind": "expense",
            "date": record.date.isoformat(),
            "record_id": record.id,
            "total": sum(values.values()),
        }

    existing = revenue_repo.get_revenue_by_date(db, payload.date)
    if existing and not payload.replace_existing:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Ngày này đã có doanh thu. Hãy xem lại dữ liệu hiện có trước khi thay thế.",
                "existing": {
                    "tien_mat": float(existing.tien_mat or 0),
                    "chuyen_khoan": float(existing.chuyen_khoan or 0),
                    "total": float(existing.total or 0),
                },
            },
        )
    if existing:
        record = revenue_service.patch_revenue(
            db,
            existing.id,
            {"tien_mat": values["tien_mat"], "chuyen_khoan": values["chuyen_khoan"]},
        )
        replaced = True
    else:
        if payload.replace_existing:
            raise HTTPException(status_code=409, detail="Doanh thu cũ không còn tồn tại; hãy xem lại bản nháp.")
        record = revenue_service.create_revenue(
            db,
            dt=payload.date,
            chuyen_khoan=values["chuyen_khoan"],
            tien_mat=values["tien_mat"],
        )
        replaced = False

    return {
        "status": "saved",
        "kind": "revenue",
        "date": record.date.isoformat(),
        "record_id": record.id,
        "total": float(record.total or 0),
        "replaced": replaced,
    }