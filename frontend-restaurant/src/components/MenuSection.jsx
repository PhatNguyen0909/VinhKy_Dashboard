import { useMemo, useState } from "react";
import ProductCard from "./ProductCard.jsx";

export default function MenuSection({ onAdd, menu }) {
  const { categories, products } = menu;
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesQuery = product.name
        .toLocaleLowerCase("vi")
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, products]);

  return (
    <>
      <section className="menu-section section-shell section-pad" id="menu">
        <div className="section-heading">
          <div>
            <span className="eyebrow eyebrow--plain">THỰC ĐƠN ĐA DẠNG</span>
            <h2>
              Bạn muốn ăn gì <em>hôm nay?</em>
            </h2>
            <p>Chọn món bạn thích, Vĩnh Ký làm ngay!</p>
          </div>
          <label className="menu-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              id="menuSearch"
              type="search"
              placeholder="Tìm món ngon..."
              aria-label="Tìm món trong thực đơn"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="category-row" role="tablist" aria-label="Danh mục món ăn">
          {categories.map((category) => (
            <button
              className={`category-chip${activeCategory === category.id ? " is-active" : ""}`}
              data-category={category.id}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              role="tab"
              aria-selected={activeCategory === category.id}
              type="button"
            >
              <span>{category.icon}</span> {category.label}
            </button>
          ))}
        </div>
        <div className="menu-feature">
          <div className="feature-copy">
            <span className="feature-kicker">MÓN NGON MỖI NGÀY</span>
            <h3>
              Chọn món ruột,
              <br />
              thưởng thức <em>trọn vị.</em>
            </h3>
            <p>Nguyên liệu tươi ngon, nấu mới khi bạn gọi.</p>
            <a href="#popular" className="text-link">
              Khám phá món ngon <span>→</span>
            </a>
          </div>
          <div className="feature-images">
            <img
              src="https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=650&q=85"
              alt="Cơm gà ăn kèm rau và nước chấm"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=85"
              alt="Mì xào thơm ngon"
              loading="lazy"
            />
            <span className="feature-stamp">
              TƯƠI NGON
              <br />
              MỖI NGÀY
            </span>
          </div>
        </div>
      </section>
      <section className="popular-section section-shell section-pad" id="popular">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="eyebrow eyebrow--plain">
              KHÁCH GỌI NHIỀU NHẤT
            </span>
            <h2>
              Món được <em>yêu thích</em>
            </h2>
          </div>
          <a className="text-link" href="#menu">
            Xem tất cả <span>→</span>
          </a>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="no-results">
            Chưa tìm thấy món phù hợp. Thử tìm với tên món khác nhé!
          </p>
        )}
      </section>
    </>
  );
}
