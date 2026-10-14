import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useRestaurant } from "../context/RestaurantContext.jsx";

const links = [
  ["Trang chủ", "#home"],
  ["Thực đơn", "#menu"],
  ["Về Vĩnh Ký", "#story"],
  ["Liên hệ", "#visit"],
];

function Brand() {
  const { name, tagline, logo } = useRestaurant();
  return (
    <a className="brand" href="#home" aria-label={`${name} - Trang chủ`}>
      <img className="brand-logo" src={logo} alt="" />
      <span className="brand-copy">
        <strong>{name}</strong>
        <small>{(tagline || "").toUpperCase()}</small>
      </span>
    </a>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

export default function SiteHeader({ cartCount, onCartOpen, onAuthOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { customer } = useAuth();
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const update = () => {
      const line = window.scrollY + 140;
      let current = links[0][1];
      links.forEach(([, href]) => {
        const el = document.querySelector(href);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) current = href;
      });
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = links[links.length - 1][1];
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const focusMenuSearch = () => {
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.querySelector("#menuSearch")?.focus(), 450);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <Brand />
      <nav
        className={`main-nav${menuOpen ? " is-open" : ""}`}
        aria-label="Điều hướng chính"
      >
        {links.map(([label, href]) => (
          <a
            className={`nav-link${active === href ? " is-current" : ""}`}
            href={href}
            key={href}
            onClick={closeMenu}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="icon-button search-trigger"
          aria-label="Tìm món ăn"
          onClick={focusMenuSearch}
          title="Tìm món ăn"
          type="button"
        >
          <SearchIcon />
        </button>
        <button
          className="icon-button cart-trigger"
          aria-label={`Mở giỏ hàng, ${cartCount} món`}
          onClick={onCartOpen}
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.5L21 8H6" />
            <circle cx="10" cy="20" r="1.2" />
            <circle cx="18" cy="20" r="1.2" />
          </svg>
          <span className="cart-count" aria-live="polite">
            {cartCount}
          </span>
        </button>
        <button
          className="user-button"
          onClick={onAuthOpen}
          title={customer ? "Tài khoản" : "Đăng nhập"}
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>{customer ? customer.name.split(" ").pop() : "Đăng nhập"}</span>
        </button>
        <a className="button button--primary header-order" href="#menu">
          Đặt món ngay <span aria-hidden="true">↗</span>
        </a>
        <button
          className="icon-button mobile-menu-toggle"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
