import { useRestaurant } from "../context/RestaurantContext.jsx";

function Brand() {
  const { name, tagline, logo } = useRestaurant();
  return (
    <a className="brand" href="#home">
      <img className="brand-logo" src={logo} alt="" />
      <span className="brand-copy">
        <strong>{name}</strong>
        <small>{(tagline || "").toUpperCase()}</small>
      </span>
    </a>
  );
}

export default function SiteFooter() {
  const r = useRestaurant();
  const socials = [
    ["f", "Facebook", r.facebook_url],
    ["◎", "Instagram", r.instagram_url],
    ["♪", "TikTok", r.tiktok_url],
  ].filter(([, , url]) => url);

  return (
    <footer className="site-footer">
      <div className="footer-main section-shell">
        <div className="footer-brand">
          <Brand />
          <p>{r.hero_subtitle}</p>
          <div className="social-links">
            {socials.map(([icon, label, url]) => (
              <a
                href={url}
                aria-label={label}
                key={label}
                target="_blank"
                rel="noreferrer"
              >
                {icon}
              </a>
            ))}
            <a
              href={`tel:${(r.phone || "").replace(/\s/g, "")}`}
              aria-label="Gọi điện"
            >
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
          <strong>{r.opening_hours}</strong>
          <p className="footer-note">Luôn sẵn sàng phục vụ món ngon!</p>
        </div>
        <div className="footer-column">
          <h3>Liên hệ</h3>
          <p>{r.address}</p>
          <a href={`tel:${(r.phone || "").replace(/\s/g, "")}`}>{r.phone}</a>
          {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
        </div>
      </div>
      <div className="footer-bottom section-shell">
        <span>© {new Date().getFullYear()} {r.name}. Món ngon mỗi ngày.</span>
      </div>
    </footer>
  );
}
