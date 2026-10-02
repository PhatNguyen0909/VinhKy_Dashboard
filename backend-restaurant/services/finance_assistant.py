import math
import re
import unicodedata
from datetime import date, timedelta


EXPENSE_ALIASES = {
    "ha": ("tien thue nha", "tien nha", "nha"),
    "gao": ("tien gao", "gao"),
    "cho": ("tien cho", "cho"),
    "kho": ("tien kho", "kho"),
    "gas": ("tien gas", "gas"),
    "dau": ("tien dau", "dau"),
    "trung": ("tien trung", "trung"),
    "hop": ("tien hop", "hop"),
    "luong": ("tien luong", "luong"),
    "ga": ("tien ga", "ga"),
    "khac": ("tien khac", "khoan khac", "khac"),
}
EXPENSE_LABELS = {
    "ha": "Tiền nhà",
    "gao": "Tiền gạo",
    "cho": "Tiền chợ",
    "kho": "Tiền khô",
    "gas": "Tiền gas",
    "dau": "Tiền dầu",
    "trung": "Trứng",
    "hop": "Tiền hộp",
    "luong": "Tiền lương",
    "ga": "Tiền gà",
    "khac": "Tiền khác",
}
REVENUE_ALIASES = {
    "tien_mat": ("tien mat", "cash"),
    "chuyen_khoan": ("chuyen khoan", "ck"),
}
REVENUE_LABELS = {"tien_mat": "Tiền mặt", "chuyen_khoan": "Chuyển khoản"}
MAX_AMOUNT = 1_000_000_000_000
AMOUNT_PATTERN = re.compile(
    r"(?<![\w])\d[\d.,]*(?:\s*(?:ty|trieu|tr|nghin|ngan|k|dong|d))?(?!\w)"
)


def normalize_text(value):
    normalized = unicodedata.normalize("NFD", value)
    return "".join(
        character
        for character in normalized
        if unicodedata.category(character) != "Mn"
    ).replace("đ", "d").lower()


def _date_from_text(text, today):
    relative_dates = (
        ("hom nay", 0),
        ("hom qua", -1),
        ("hom kia", -2),
        ("ngay kia", 2),
        ("ngay mai", 1),
    )
    matches = []
    for phrase, offset in relative_dates:
        for match in re.finditer(rf"\b{re.escape(phrase)}\b", text):
            matches.append((match.start(), match.end(), today + timedelta(days=offset)))

    patterns = (
        (
            re.compile(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b"),
            lambda match: (int(match.group(1)), int(match.group(2)), int(match.group(3))),
        ),
        (
            re.compile(r"\b(?:ngay\s+)?(\d{1,2})\s+thang\s+(\d{1,2})(?:\s+nam\s+(\d{4}))?\b"),
            lambda match: (int(match.group(3) or today.year), int(match.group(2)), int(match.group(1))),
        ),
        (
            re.compile(r"\b(\d{1,2})/(\d{1,2})(?:/(\d{4}))?\b"),
            lambda match: (int(match.group(3) or today.year), int(match.group(2)), int(match.group(1))),
        ),
        (
            re.compile(r"\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b"),
            lambda match: (int(match.group(3)), int(match.group(2)), int(match.group(1))),
        ),
    )
    invalid_date = False
    for pattern, get_parts in patterns:
        for match in pattern.finditer(text):
            try:
                year, month, day = get_parts(match)
                parsed = date(year, month, day)
            except ValueError:
                invalid_date = True
                continue
            matches.append((match.start(), match.end(), parsed))

    if not matches:
        return None, text, invalid_date
    start, end, parsed = max(matches, key=lambda item: item[0])
    return parsed, text[:start] + " " + text[end:], invalid_date


def _parse_amount(token):
    match = re.fullmatch(r"(\d[\d.,]*)(ty|trieu|tr|nghin|ngan|k|dong|d)?", token)
    if not match:
        return None
    raw, unit = match.groups()
    separators = [index for index, character in enumerate(raw) if character in ".,"]
    if separators:
        last_separator = separators[-1]
        decimal_digits = len(raw) - last_separator - 1
        if len(separators) > 1 or decimal_digits == 3:
            normalized_number = raw.replace(".", "").replace(",", "")
        else:
            normalized_number = (
                raw[:last_separator].replace(".", "").replace(",", "")
                + "."
                + raw[last_separator + 1:]
            )
    else:
        normalized_number = raw

    try:
        amount = float(normalized_number)
    except ValueError:
        return None
    if unit in ("k", "nghin", "ngan"):
        amount *= 1_000
    elif unit in ("tr", "trieu"):
        amount *= 1_000_000
    elif unit == "ty":
        amount *= 1_000_000_000
    if not math.isfinite(amount) or amount < 0 or amount > MAX_AMOUNT:
        return None
    return amount


def _find_field_mentions(text, aliases):
    found = []
    for key, field_aliases in aliases.items():
        for alias in sorted(field_aliases, key=len, reverse=True):
            for match in re.finditer(rf"\b{re.escape(alias)}\b", text):
                found.append((match.start(), match.end(), key))
    found.sort(key=lambda item: (item[0], -(item[1] - item[0])))

    non_overlapping = []
    last_end = -1
    for mention in found:
        if mention[0] < last_end:
            continue
        non_overlapping.append(mention)
        last_end = mention[1]
    return non_overlapping


def _amounts_after_mentions(text, mentions, keys):
    values = {key: 0.0 for key in keys}
    missing = []
    for index, (_, end, key) in enumerate(mentions):
        next_start = mentions[index + 1][0] if index + 1 < len(mentions) else len(text)
        tokens = AMOUNT_PATTERN.findall(text[end:next_start])
        amount = _parse_amount(re.sub(r"\s+", "", tokens[-1])) if tokens else None
        if amount is None:
            missing.append(key)
        else:
            values[key] = amount
    return values, missing


def _looks_like_revenue(text):
    return bool(re.search(r"\b(doanh thu|thu duoc|thu nhap|ban hang|tien ban hang)\b", text))


def _looks_like_expense(text):
    return bool(re.search(r"\b(chi phi|chi tieu|khoan chi|chi ra)\b", text))


def _transaction_draft(text, today):
    normalized = normalize_text(text)
    parsed_date, transaction_text, invalid_date = _date_from_text(normalized, today)
    is_revenue = _looks_like_revenue(transaction_text)
    is_expense = _looks_like_expense(transaction_text)
    expense_mentions = _find_field_mentions(transaction_text, EXPENSE_ALIASES)
    revenue_mentions = _find_field_mentions(transaction_text, REVENUE_ALIASES)
    is_expense = is_expense or bool(expense_mentions)

    if is_revenue and is_expense:
        return None, "Bạn đang nhắc cả khoản thu và chi. Hãy tạo từng phiếu riêng để tránh nhầm dữ liệu."

    if is_expense:
        if not expense_mentions:
            return None, "Bạn cho biết các hạng mục chi cụ thể nhé, ví dụ tiền chợ, tiền nhà hoặc tiền gas."
        values, missing = _amounts_after_mentions(transaction_text, expense_mentions, EXPENSE_ALIASES.keys())
        if missing:
            labels = ", ".join(dict.fromkeys(EXPENSE_LABELS[key] for key in missing))
            return None, f"Mình chưa thấy số tiền cho {labels}."
        kind, labels = "expense", EXPENSE_LABELS
    elif is_revenue:
        if not revenue_mentions:
            return None, "Bạn cho biết doanh thu là tiền mặt hay chuyển khoản nhé."
        values, missing = _amounts_after_mentions(transaction_text, revenue_mentions, REVENUE_ALIASES.keys())
        if missing:
            labels = ", ".join(dict.fromkeys(REVENUE_LABELS[key] for key in missing))
            return None, f"Mình chưa thấy số tiền cho {labels}."
        kind, labels = "revenue", REVENUE_LABELS
    else:
        return None, None

    if invalid_date and parsed_date is None:
        return None, "Mình chưa đọc được ngày. Hãy ghi ngày dạng dd/mm/yyyy hoặc YYYY-MM-DD nhé."
    if parsed_date is None:
        return None, "Bạn muốn ghi nhận giao dịch cho ngày nào?"
    if not any(amount > 0 for amount in values.values()):
        return None, "Hãy nhập ít nhất một khoản tiền lớn hơn 0 nhé."
    return {"kind": kind, "date": parsed_date.isoformat(), "values": values, "labels": labels}, None


def _answer_summary(text, finance_context, today):
    expenses = finance_context.get("expenses", [])
    revenues = finance_context.get("revenues", [])
    parsed_date, _, _ = _date_from_text(text, today)
    if parsed_date:
        start = end = parsed_date.isoformat()
        period = f"ngày {start}"
    elif "thang nay" in text:
        start = today.replace(day=1).isoformat()
        end = today.isoformat()
        period = "tháng này"
    else:
        start = finance_context.get("coverage", {}).get("from", "")
        end = finance_context.get("coverage", {}).get("through", today.isoformat())
        period = f"từ {start} đến {end}"

    relevant_expenses = [row for row in expenses if start <= row["date"] <= end]
    relevant_revenues = [row for row in revenues if start <= row["date"] <= end]
    total_expense = sum(row["total_vnd"] for row in relevant_expenses)
    total_revenue = sum(row["total_vnd"] for row in relevant_revenues)

    if re.search(r"\b(loi nhuan|lai rong|lai)\b", text):
        return f"Trong {period}, doanh thu {total_revenue:,.0f} đ, chi phí {total_expense:,.0f} đ; lợi nhuận tạm tính {total_revenue - total_expense:,.0f} đ."
    if re.search(r"\b(doanh thu|thu nhap)\b", text):
        return f"Doanh thu ghi nhận trong {period} là {total_revenue:,.0f} đ."
    if re.search(r"\b(chi phi|chi tieu|da chi)\b", text):
        return f"Chi phí ghi nhận trong {period} là {total_expense:,.0f} đ."
    return None


def _answer_help():
    return (
        "Trợ lý nhập liệu miễn phí, không gọi dịch vụ AI bên ngoài. "
        "Hãy ghi rõ ngày, khoản thu/chi và số tiền. Ví dụ: “hôm qua chi chợ 50k, gas 120k” "
        "hoặc “ngày 02/10/2026 doanh thu tiền mặt 1 triệu, chuyển khoản 2,5 triệu”."
    )


def ask_finance_assistant(messages, today, finance_context):
    user_text = " ".join(message.content for message in messages if message.role == "user")
    if not user_text:
        return {"reply": _answer_help(), "draft": None}
    normalized = normalize_text(user_text)
    _, without_date, _ = _date_from_text(normalized, today)
    has_amount = bool(AMOUNT_PATTERN.search(without_date))
    asks_summary = bool(re.search(r"\b(bao nhieu|tong|thong ke|loi nhuan|lai rong|so sanh)\b", normalized))

    if asks_summary and not has_amount:
        summary = _answer_summary(normalized, finance_context, today)
        if summary:
            return {"reply": summary, "draft": None}

    draft, clarification = _transaction_draft(user_text, today)
    if clarification:
        return {"reply": clarification, "draft": None}
    if draft:
        existing = None
        if draft["kind"] == "revenue":
            existing = next((row for row in finance_context.get("revenues", []) if row["date"] == draft["date"]), None)
        values_text = ", ".join(f"{draft['labels'][key]} {amount:,.0f} đ" for key, amount in draft["values"].items() if amount > 0)
        kind_label = "chi phí" if draft["kind"] == "expense" else "doanh thu"
        reply = f"Bản nháp {kind_label} ngày {draft['date']}: {values_text}. Kiểm tra lại rồi xác nhận lưu nhé."
        safe_draft = {key: value for key, value in draft.items() if key != "labels"}
        if existing:
            safe_draft["existing"] = {
                "tien_mat": existing["cash_vnd"],
                "chuyen_khoan": existing["transfer_vnd"],
                "total": existing["total_vnd"],
            }
            reply += " Ngày này đã có doanh thu; xác nhận sẽ thay thế số cũ."
        return {"reply": reply, "draft": safe_draft}

    summary = _answer_summary(normalized, finance_context, today) if asks_summary else None
    return {"reply": summary or _answer_help(), "draft": None}