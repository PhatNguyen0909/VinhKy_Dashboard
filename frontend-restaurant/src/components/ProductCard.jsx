export function formatPrice(price) {
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

export default function ProductCard({ product, onAdd }) {
  return (
    <article
      className="product-card"
      data-category={product.category}
      data-name={product.name}
    >
      <div className="product-photo">
        <img
          src={product.image}
          alt={product.imageDescription}
          loading="lazy"
        />
        <span className={`product-tag${product.softTag ? " product-tag--soft" : ""}`}>
          {product.tag}
        </span>
        <span className="product-rating">★ {product.rating}</span>
        <button
          className="quick-add"
          onClick={() => onAdd(product.id)}
          aria-label={`Thêm ${product.name} vào giỏ`}
          type="button"
        >
          +
        </button>
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <p>{product.description}</p>
        <button
          className="add-link"
          onClick={() => onAdd(product.id)}
          type="button"
        >
          Thêm vào giỏ <span>＋</span>
        </button>
      </div>
    </article>
  );
}
