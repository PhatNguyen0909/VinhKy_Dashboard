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

MENU_ADDITIONS = [
    ("Hủ tiếu", [
        ("Hủ tiếu xào thập cẩm", 55000),
        ("Hủ tiếu xào hải sản", 55000),
        ("Hủ tiếu xào tôm bò", 60000),
        ("Hủ tiếu xào bò/mực/tôm", 60000),
    ]),
    ("Mì xào giòn", [
        ("Mì giòn xào thập cẩm", 55000),
        ("Mì giòn xào hải sản", 55000),
        ("Mì giòn xào tôm bò", 60000),
        ("Mì giòn xào bò/mực/tôm", 60000),
    ]),
    ("Bún gạo", [
        ("Bún gạo xào thập cẩm", 55000),
        ("Bún gạo xào hải sản", 55000),
        ("Bún gạo xào tôm bò", 60000),
        ("Bún gạo xào bò/mực/tôm", 60000),
    ]),
    ("Mì gói", [
        ("Mì gói xào thập cẩm", 55000),
        ("Mì gói xào hải sản", 55000),
        ("Mì gói xào tôm bò", 60000),
        ("Mì gói xào bò/mực/tôm", 60000),
    ]),
    ("Mì mềm", [
        ("Mì mềm xào thập cẩm", 55000),
        ("Mì mềm xào hải sản", 55000),
        ("Mì mềm xào tôm bò", 60000),
        ("Mì mềm xào bò/mực/tôm", 60000),
    ]),
    ("Nui", [
        ("Nui xào thập cẩm", 55000),
        ("Nui xào hải sản", 55000),
        ("Nui xào tôm bò", 60000),
        ("Nui xào bò/mực/tôm", 60000),
    ]),
    ("Cơm chiên", [
        ("Cơm chiên bò xào củ hành tây", 60000),
        ("Cơm chiên bò lúc lắc", 60000),
        ("Cơm chiên bò xào cải chua", 60000),
        ("Cơm chiên bò xào cải", 60000),
        ("Cơm chiên cà ri bò", 60000),
        ("Cơm chiên cà ri tôm", 60000),
        ("Cơm chiên hải sản", 55000),
        ("Cơm chiên dương châu", 55000),
        ("Cơm chiên cá mặn", 55000),
        ("Cơm chiên hải sản phủ trứng", 70000),
        ("Cơm chiên dương châu hải sản phủ trứng", 90000),
        ("Cơm tôm nước mắm/sa tế", 60000),
        ("Cơm mực nước mắm/sa tế", 60000),
        ("Cơm xào hải sản", 60000),
        ("Cơm xào thập cẩm", 60000),
        ("Cơm xào tôm/mực/bò", 60000),
        ("Cơm sườn xào chua ngọt", 65000),
        ("Cơm mực xào chua ngọt", 65000),
        ("Cơm tôm xào chua ngọt", 65000),
    ]),
    ("Món thêm", [
        ("Bò lúc lắc", 60000),
        ("Gà nước mắm", 50000),
        ("Tôm lăn bột", 55000),
        ("Cải xào tỏi", 20000),
        ("Cơm thêm", 10000),
        ("Canh", 8000),
    ]),
    ("Nước uống", [
        ("Nước ngọt các loại", 15000),
        ("Nước suối", 10000),
        ("Trà đá", 2000),
    ]),
]


def seed_menu(db: Session) -> None:
    if not db.query(Category).count():
        for order, (name, products) in enumerate(SEED):
            category = Category(name=name, sort_order=order)
            db.add(category)
            db.flush()
            for pname, desc, price, rating, best, image in products:
                db.add(Product(category_id=category.id, name=pname, description=desc,
                               price=price, rating=rating, is_best_seller=best, image=image))

    categories = {
        category.name.strip().casefold(): category
        for category in db.query(Category).all()
    }
    for category_name, products in MENU_ADDITIONS:
        key = category_name.casefold()
        category = categories.get(key)
        if category is None:
            last_order = max(
                (item.sort_order or 0 for item in categories.values()),
                default=-1,
            )
            category = Category(name=category_name, sort_order=last_order + 1)
            db.add(category)
            db.flush()
            categories[key] = category

        existing_names = {
            product.name.strip().casefold()
            for product in db.query(Product)
            .filter(Product.category_id == category.id)
            .all()
        }
        for name, price in products:
            product_key = name.casefold()
            if product_key in existing_names:
                continue
            db.add(Product(
                category_id=category.id,
                name=name,
                description="",
                price=price,
                rating=0,
                is_best_seller=False,
                image="",
            ))
            existing_names.add(product_key)

    db.commit()
