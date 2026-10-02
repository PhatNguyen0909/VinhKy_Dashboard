import math
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
from services.finance_assistant import ask_finance_assistant

router = APIRouter(prefix="/api/assistant", tags=["finance-assistant"])
EXPENSE_KEYS = ("ha", "gao", "cho", "kho", "gas", "dau", "trung", "hop", "luong", "ga", "khac")
REVENUE_KEYS = ("tien_mat", "chuyen_khoan")
MAX_AMOUNT = 1_000_000_000_000


def _read_finance_context(db: Session, today: date):
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


def _validate_local_draft(raw_draft):
    if not isinstance(raw_draft, dict):
        return None
    kind = raw_draft.get("kind")
    if kind not in ("expense", "revenue"):
        return None
    try:
        parsed_date = date.fromisoformat(raw_draft.get("date", ""))
    except (TypeError, ValueError):
        return None

    allowed_keys = EXPENSE_KEYS if kind == "expense" else REVENUE_KEYS
    raw_values = raw_draft.get("values")
    if not isinstance(raw_values, dict) or set(raw_values) - set(allowed_keys):
        return None

    values = {key: 0.0 for key in allowed_keys}
    for key, raw_value in raw_values.items():
        if isinstance(raw_value, bool) or not isinstance(raw_value, (int, float)):
            return None
        amount = float(raw_value)
        if not math.isfinite(amount) or amount < 0 or amount > MAX_AMOUNT:
            return None
        values[key] = amount
    if not any(amount > 0 for amount in values.values()):
        return None
    return {"kind": kind, "date": parsed_date.isoformat(), "values": values}


@router.post("/chat")
def chat_with_finance_assistant(
    payload: AssistantChatRequest,
    db: Session = Depends(get_db),
):
    if not payload.messages or payload.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="Tin nhắn cuối phải là câu hỏi của người dùng.")
    if len(payload.messages) > 24:
        raise HTTPException(status_code=422, detail="Hội thoại quá dài; hãy bắt đầu cuộc trò chuyện mới.")

    try:
        context = _read_finance_context(db, payload.today)
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Không thể đọc dữ liệu tài chính để trả lời lúc này.",
        ) from error

    result = ask_finance_assistant(payload.messages[-20:], payload.today, context)
    reply = result.get("reply") if isinstance(result, dict) else None
    if not isinstance(reply, str) or not reply.strip():
        reply = "Bạn có thể nói rõ hơn để mình hỗ trợ nhé."
    draft = _validate_local_draft(result.get("draft"))
    if result.get("draft") is not None and draft is None:
        return {
            "reply": "Mình chưa hiểu chắc ngày hoặc số tiền. Hãy ghi ngày và từng khoản cụ thể giúp mình nhé.",
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
        record = expense_service.add_expense_item(db, {"date": payload.date, **values})
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