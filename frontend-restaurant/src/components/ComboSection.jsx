import { formatPrice } from "./ProductCard.jsx";

export default function ComboSection({ onAdd, menu }) {
  const comboCategory = menu.categories.find((c) => /combo/i.test(c.label));
  const combos = comboCategory
    ? menu.products.filter((p) => p.category === comboCategory.id)
    : [];
  const [main, group] = combos;
  if (!main) return null;

  return (
    <section className="combo-section section-shell">
      <article className="combo-card combo-card--main">
        <div className="combo-copy">
          <span className="combo-label">ƯU ĐÃI COMBO</span>
          <h2>{main.name}</h2>
          <p>{main.description}</p>
          <strong>Chỉ từ {formatPrice(main.price)}</strong>
          <button
            className="button button--dark"
            onClick={() => onAdd(main.id)}
            type="button"
          >
            Đặt combo <span>↗</span>
          </button>
        </div>
        <div className="combo-visual">
          {main.image && <img src={main.image} alt={main.name} loading="lazy" />}
          <span className="combo-sun">
            COMBO
            <small>HOT</small>
          </span>
        </div>
        <span className="combo-decoration">✳</span>
      </article>
      {group && (
        <article className="combo-card combo-card--group">
          <span className="eyebrow eyebrow--plain">COMBO NHÓM</span>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <button
            className="text-link"
            onClick={() => onAdd(group.id)}
            type="button"
          >
            Xem ngay <span>→</span>
          </button>
          {group.image && <img src={group.image} alt={group.name} loading="lazy" />}
          <span className="group-price">Từ {formatPrice(group.price)}</span>
        </article>
      )}
    </section>
  );
}
