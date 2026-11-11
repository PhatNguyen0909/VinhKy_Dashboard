import { useRestaurant } from "../context/RestaurantContext.jsx";
import { formatPrice } from "./ProductCard.jsx";

export default function HeroSection() {
  const r = useRestaurant();
  const [headline, ...rest] = (r.hero_title || "").split(". ");
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="eyebrow-flame">♨</span> NÓNG HỔI MỖI NGÀY
        </span>
        <h1>
          {rest.length ? `${headline}.` : r.hero_title}
          <br />
          <em>{rest.join(". ")}</em>
        </h1>
        <h2>
          {r.name} <span>·</span> {r.tagline}
        </h2>
        <p>{r.hero_subtitle}</p>
        <div className="hero-buttons">
          <a className="button button--primary" href="#menu">
            Xem thực đơn <span aria-hidden="true">↗</span>
          </a>
          <a className="button button--outline" href="#visit">
            <span className="play-icon">▶</span> Ghé thăm quán
          </a>
        </div>
        <div className="hero-proof">
          <div className="proof-rating">
            <span className="stars">★★★★★</span>
            <strong>{r.rating}/5</strong>
            <small>Khách hàng yêu thích</small>
          </div>
          <span className="proof-divider" />
          <div className="proof-delivery">
            <span className="delivery-icon">◷</span>
            <strong>{r.delivery_time}</strong>
            <small>Giao món nóng hổi</small>
          </div>
        </div>
      </div>
      <div className="hero-art" aria-label={r.name}>
        <div className="hero-ring hero-ring--outer" />
        <div className="hero-ring hero-ring--inner" />
        <span className="hero-spark spark-one">✳</span>
        <span className="hero-spark spark-two">✦</span>
        <img className="hero-food" src={r.heroImage} alt={r.name} />
        <div className="fresh-note">
          <span>♧</span>
          <strong>
            Tươi ngon
            <br />
            mỗi ngày
          </strong>
        </div>
        <div className="hero-price">
          <span>Vị ngon thân quen</span>
          <strong>Từ {formatPrice(Number(r.min_price) || 0)}</strong>
        </div>
      </div>
      <a className="scroll-cue" href="#menu">
        <span /> CUỘN ĐỂ KHÁM PHÁ
      </a>
    </section>
  );
}
