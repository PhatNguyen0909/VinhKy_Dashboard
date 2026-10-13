export default function HeroSection() {
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="eyebrow-flame">♨</span> NÓNG HỔI MỖI NGÀY
        </span>
        <h1>
          Ngon tròn vị.
          <br />
          <em>Ăn là nhớ.</em>
        </h1>
        <h2>
          Cơm Gà <span>·</span> Mì Xào Giòn Vĩnh Ký
        </h2>
        <p>
          Món ngon nóng hổi, chế biến mỗi ngày và giao tận nơi. Bữa ăn thân
          quen, được chăm chút bằng cả tấm lòng.
        </p>
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
            <strong>4.9/5</strong>
            <small>Khách hàng yêu thích</small>
          </div>
          <span className="proof-divider" />
          <div className="proof-delivery">
            <span className="delivery-icon">◷</span>
            <strong>30 phút</strong>
            <small>Giao món nóng hổi</small>
          </div>
        </div>
      </div>
      <div className="hero-art" aria-label="Cơm gà Vĩnh Ký nóng hổi">
        <div className="hero-ring hero-ring--outer" />
        <div className="hero-ring hero-ring--inner" />
        <span className="hero-spark spark-one">✳</span>
        <span className="hero-spark spark-two">✦</span>
        <span className="hero-doodle">福</span>
        <img
          className="hero-food"
          src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=88"
          alt="Đĩa cơm gà vàng ươm ăn kèm rau xanh"
        />
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
          <strong>Từ 45.000đ</strong>
        </div>
        <div className="mascot mascot--hero" aria-hidden="true">
          <i />
          <b>•ᴗ•</b>
          <span>⌣</span>
        </div>
      </div>
      <a className="scroll-cue" href="#menu">
        <span /> CUỘN ĐỂ KHÁM PHÁ
      </a>
    </section>
  );
}
