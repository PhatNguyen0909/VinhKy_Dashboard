from sqlalchemy.orm import Session

from models.website import Category, Product

SEED = [
    ("Cơm gà", [
        ("Cơm Gà Hải Nam", "Gà luộc mềm mọng, cơm thơm nấu từ nước gà.", 55000, 4.9, True,
         "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85"),
        ("Cơm Gà Xối Mỡ", "Da gà vàng giòn, cơm gà dẻo thơm đậm đà.", 55000, 4.8, False,
         "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85"),
    ]),
    ("Mì xào giòn", [
        ("Mì Xào Giòn Hải Sản", "Mì giòn rụm, hải sản tươi và rau xanh.", 65000, 4.9, True,
         "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=85"),
    ]),
    ("Cơm chiên", [
        ("Cơm Chiên Gà Xé", "Cơm chiên tơi thơm, gà xé và rau củ tươi.", 50000, 4.8, False,
         "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85"),
    ]),
    ("Combo", [
        ("Combo Vĩnh Ký", "2 phần ăn tự chọn kèm 2 nước mát lạnh.", 119000, 4.9, False,
         "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85"),
    ]),
    ("Nước uống", [
        ("Trà Tắc Mật Ong", "Chua ngọt dịu nhẹ, giải nhiệt sảng khoái.", 18000, 4.8, False,
         "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85"),
    ]),
]


def seed_menu(db: Session) -> None:
    if db.query(Category).count():
        return
    for order, (name, products) in enumerate(SEED):
        category = Category(name=name, sort_order=order)
        db.add(category)
        db.flush()
        for pname, desc, price, rating, best, image in products:
            db.add(Product(category_id=category.id, name=pname, description=desc,
                           price=price, rating=rating, is_best_seller=best, image=image))
    db.commit()
