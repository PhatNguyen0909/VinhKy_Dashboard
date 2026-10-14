import { useMemo, useState } from "react";
import { useRestaurant } from "../context/RestaurantContext.jsx";
import ProductCard from "./ProductCard.jsx";

export default function MenuSection({ onAdd, menu }) {
  const restaurant = useRestaurant();
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

  const selectCategory = (id) => {
    setActiveCategory(id);
    setQuery("");
    window.setTimeout(
      () => document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" }),
      30,
    );
  };

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
              onClick={() => selectCategory(category.id)}
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
            {[products[0], products[1]].map((p, i) => (
              <img
                key={p?.id || i}
                src={p?.image || restaurant.heroImage}
                alt={p?.name || restaurant.name}
                loading="lazy"
              />
            ))}
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
