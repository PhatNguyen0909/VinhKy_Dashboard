import { combos } from "../data/menu.js";
import { formatPrice } from "./ProductCard.jsx";

export default function ComboSection({ onAdd }) {
  return (
    <section className="combo-section section-shell">
      <article className="combo-card combo-card--main">
        <div className="combo-copy">
          <span className="combo-label">TIẾT KIỆM ĐẾN 20%</span>
          <h2>
            Combo
            <br />
            <em>Vĩnh Ký</em>
          </h2>
          <p>
            2 phần ăn tự chọn
            <br />+ 2 nước mát lạnh
          </p>
          <strong>Chỉ từ {formatPrice(combos.standard.price)}</strong>
          <button
            className="button button--dark"
            onClick={() => onAdd("combo")}
            type="button"
          >
            Đặt combo <span>↗</span>
          </button>
        </div>
        <div className="combo-visual">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85"
            alt="Combo bữa ăn đầy đủ và hấp dẫn"
            loading="lazy"
          />
          <span className="combo-sun">
            -20%
            <small>COMBO</small>
          </span>
        </div>
        <span className="combo-decoration">✳</span>
      </article>
      <article className="combo-card combo-card--group">
        <span className="eyebrow eyebrow--plain">COMBO NHÓM</span>
        <h3>
          Vui hơn khi ăn
          <br />
          cùng nhau.
        </h3>
        <p>4 món chính + 4 nước</p>
        <button
          className="text-link"
          onClick={() => onAdd("group-combo")}
          type="button"
        >
          Xem ngay <span>→</span>
        </button>
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=85"
          alt="Bữa ăn thịnh soạn dành cho nhóm bạn"
          loading="lazy"
        />
        <span className="group-price">
          Từ {formatPrice(combos.group.price)}
        </span>
      </article>
    </section>
  );
}
