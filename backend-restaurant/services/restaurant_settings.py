from typing import Dict

from sqlalchemy.orm import Session

from models.website import RestaurantSetting

DEFAULTS: Dict[str, str] = {
    "name": "Vĩnh Ký",
    "tagline": "Cơm Gà · Mì Xào Giòn",
    "hero_title": "Ngon tròn vị. Ăn là nhớ.",
    "hero_subtitle": "Cơm gà, mì xào giòn nóng hổi, chế biến mỗi ngày và giao tận nơi.",
    "story_title": "Câu chuyện Vĩnh Ký",
    "story_text": "Từ một quán nhỏ, Vĩnh Ký giữ trọn hương vị cơm gà và mì xào giòn "
    "được nấu mới mỗi ngày bằng nguyên liệu tươi.",
    "years_experience": "10+",
    "rating": "4.9",
    "delivery_time": "30 phút",
    "min_price": "45000",
    "address": "125 Nguyễn Tri Phương, P.7, Q.5, TP.HCM",
    "phone": "0901234567",
    "email": "",
    "opening_hours": "10:00 – 21:30",
    "maps_url": "",
    "facebook_url": "",
    "instagram_url": "",
    "tiktok_url": "",
    "bank_id": "ACB",
    "bank_account": "4914991",
    "bank_owner": "NGUYEN HUU VINH PHAT",
    "logo_url": "",
    "hero_image_url": "",
    "story_image_url": "",
}


def get_settings(db: Session) -> Dict[str, str]:
    data = dict(DEFAULTS)
    for row in db.query(RestaurantSetting).all():
        if row.key in DEFAULTS:
            data[row.key] = row.value or ""
    return data


def save_settings(db: Session, values: Dict[str, str]) -> Dict[str, str]:
    for key, value in values.items():
        if key not in DEFAULTS:
            continue
        row = db.get(RestaurantSetting, key)
        if row:
            row.value = value
        else:
            db.add(RestaurantSetting(key=key, value=value))
    db.commit()
    return get_settings(db)


def seed_settings(db: Session) -> None:
    existing = {row.key for row in db.query(RestaurantSetting).all()}
    for key, value in DEFAULTS.items():
        if key not in existing:
            db.add(RestaurantSetting(key=key, value=value))
    db.commit()
