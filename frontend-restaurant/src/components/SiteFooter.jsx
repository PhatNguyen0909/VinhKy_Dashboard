function Brand() {
  return (
    <a className="brand" href="#home">
      <span className="mascot mascot--small" aria-hidden="true">
        <i />
        <b>•ᴗ•</b>
      </span>
      <span className="brand-copy">
        <strong>Vĩnh Ký</strong>
        <small>CƠM GÀ · MÌ XÀO GIÒN</small>
      </span>
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main section-shell">
        <div className="footer-brand">
          <Brand />
          <p>
            Món ngon nóng hổi, nấu bằng cả tấm lòng và giao đến tận cửa nhà
            bạn.
          </p>
          <div className="social-links">
            <a href="#visit" aria-label="Facebook">
              f
            </a>
            <a href="#visit" aria-label="TikTok">
              ♪
            </a>
            <a href="tel:0901234567" aria-label="Gọi điện">
              ☎
            </a>
          </div>
        </div>
        <div className="footer-column">
          <h3>Khám phá</h3>
          <a href="#home">Trang chủ</a>
          <a href="#menu">Thực đơn</a>
          <a href="#story">Về chúng tôi</a>
          <a href="#visit">Liên hệ</a>
        </div>
        <div className="footer-column">
          <h3>Giờ mở cửa</h3>
          <p>Thứ 2 – Chủ nhật</p>
          <strong>10:00 – 21:30</strong>
          <p className="footer-note">Luôn sẵn sàng phục vụ món ngon!</p>
        </div>
        <div className="footer-column">
          <h3>Liên hệ</h3>
          <p>
            125 Nguyễn Tri Phương
            <br />
            P.7, Q.5, TP.HCM
          </p>
          <a href="tel:0901234567">090 123 4567</a>
          <a href="#menu">Đặt món trực tuyến</a>
        </div>
      </div>
      <div className="footer-bottom section-shell">
        <span>© 2026 Vĩnh Ký. Món ngon mỗi ngày.</span>
        <span>
          Được làm bằng cả tấm lòng tại Sài Gòn <b>♥</b>
        </span>
      </div>
    </footer>
  );
}
