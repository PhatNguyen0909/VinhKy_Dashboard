import { useState } from "react";

const links = [
  ["Trang chủ", "#home"],
  ["Thực đơn", "#menu"],
  ["Về Vĩnh Ký", "#story"],
  ["Liên hệ", "#visit"],
];

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Vĩnh Ký - Trang chủ">
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

export default function SiteHeader({ cartCount, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
        {links.map(([label, href], index) => (
          <a
            className={`nav-link${index === 0 ? " is-current" : ""}`}
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
