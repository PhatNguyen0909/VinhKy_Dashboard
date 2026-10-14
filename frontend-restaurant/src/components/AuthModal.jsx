import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "./ProductCard.jsx";

const STATUS = {
  new: "Chờ xác nhận",
  preparing: "Đang chuẩn bị",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};

function Orders() {
  const { myOrders } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    myOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!orders) return <p className="auth-hint">Đang tải đơn hàng...</p>;
  if (!orders.length) return <p className="auth-hint">Bạn chưa có đơn hàng nào.</p>;
  return (
    <div className="order-list">
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <header>
            <strong>{order.code}</strong>
            <span className={`order-status order-status--${order.status}`}>
              {STATUS[order.status] || order.status}
            </span>
          </header>
          <p>
            {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
          </p>
          <footer>
            <span>
              {order.payment_method === "transfer" ? "Chuyển khoản" : "Tiền mặt"} ·{" "}
              {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
            <b>{formatPrice(order.total)}</b>
          </footer>
        </article>
      ))}
    </div>
  );
}

export default function AuthModal({ open, onClose }) {
  const { customer, login, register, logout, updateProfile } = useAuth();
  const [mode, setMode] = useState("login");
  const [tab, setTab] = useState("orders");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", address: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer) {
      setProfile({
        name: customer.name || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.phone.trim() || !form.password) {
      setError("Vui lòng nhập số điện thoại và mật khẩu.");
      return;
    }
    if (mode === "register") {
      if (!form.name.trim()) return setError("Vui lòng nhập họ tên.");
      if (form.password.length < 6)
        return setError("Mật khẩu cần ít nhất 6 ký tự.");
    }
    setBusy(true);
    try {
      if (mode === "login") await login(form.phone.trim(), form.password);
      else
        await register({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      setForm({ name: "", phone: "", email: "", password: "" });
      if (mode === "login") onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await updateProfile(profile);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-cart" onClick={onClose} aria-label="Đóng" type="button">
          ×
        </button>
        {customer ? (
          <>
            <h2>Xin chào, {customer.name}</h2>
            <p className="auth-hint">{customer.phone}</p>
            <div className="auth-tabs">
              <button
                className={tab === "orders" ? "is-active" : ""}
                onClick={() => setTab("orders")}
                type="button"
              >
                Đơn hàng
              </button>
              <button
                className={tab === "profile" ? "is-active" : ""}
                onClick={() => setTab("profile")}
                type="button"
              >
                Thông tin
              </button>
            </div>
            {tab === "orders" ? (
              <Orders />
            ) : (
              <form className="auth-form" onSubmit={saveProfile}>
                <label>
                  Họ tên
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </label>
                <label>
                  Email
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </label>
                <label>
                  Địa chỉ giao hàng mặc định
                  <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </label>
                {error && <small className="form-error" role="alert">{error}</small>}
                <button className="button button--primary" type="submit">
                  {saved ? "Đã lưu ✓" : "Lưu thông tin"}
                </button>
              </form>
            )}
            <button
              className="text-link auth-logout"
              onClick={() => {
                logout();
                onClose();
              }}
              type="button"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <h2>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
            <p className="auth-hint">
              {mode === "login"
                ? "Đăng nhập để đặt món nhanh và xem lịch sử đơn hàng."
                : "Đăng ký bằng số điện thoại để lưu thông tin giao hàng."}
            </p>
            <form className="auth-form" onSubmit={submit}>
              {mode === "register" && (
                <label>
                  Họ tên
                  <input value={form.name} onChange={setField("name")} autoComplete="name" />
                </label>
              )}
              <label>
                Số điện thoại
                <input value={form.phone} onChange={setField("phone")} inputMode="tel" autoComplete="tel" />
              </label>
              {mode === "register" && (
                <label>
                  Email (không bắt buộc)
                  <input type="email" value={form.email} onChange={setField("email")} autoComplete="email" />
                </label>
              )}
              <label>
                Mật khẩu
                <input
                  type="password"
                  value={form.password}
                  onChange={setField("password")}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>
              {error && <small className="form-error" role="alert">{error}</small>}
              <button className="button button--primary" disabled={busy} type="submit">
                {busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            </form>
            <button
              className="text-link auth-switch"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              type="button"
            >
              {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
