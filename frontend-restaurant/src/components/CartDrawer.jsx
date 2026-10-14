import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useRestaurant } from "../context/RestaurantContext.jsx";
import { API_URL } from "../hooks/useMenu.js";
import { formatPrice } from "./ProductCard.jsx";

export default function CartDrawer({
  cart,
  cartCount,
  isOpen,
  onClose,
  onQuantityChange,
  onRemove,
  onOrderPlaced,
  onLoginRequest,
}) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [method, setMethod] = useState("transfer");
  const [step, setStep] = useState("cart");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);
  const items = Object.entries(cart);
  const total = items.reduce(
    (sum, [, item]) => sum + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    document.body.classList.toggle("cart-open", isOpen);
    return () => document.body.classList.remove("cart-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  const restaurant = useRestaurant();
  const { customer, token } = useAuth();
  const bank = {
    id: restaurant.bank_id || "ACB",
    account: restaurant.bank_account || "4914991",
    owner: restaurant.bank_owner || "NGUYEN HUU VINH PHAT",
  };

  useEffect(() => {
    if (!customer) return;
    setForm((current) => ({
      ...current,
      name: current.name || customer.name || "",
      phone: current.phone || customer.phone || "",
      address: current.address || customer.address || "",
    }));
  }, [customer]);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!customer) {
      setError("Vui lòng đăng nhập để đặt món.");
      onLoginRequest();
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    if (form.address.trim().length < 3) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
          payment_method: method,
          items: items.map(([, item]) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });
      if (!response.ok) throw new Error("order failed");
      setPlaced(await response.json());
      onOrderPlaced();
    } catch {
      setError("Không gửi được đơn hàng. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const closeAll = () => {
    setStep("cart");
    setPlaced(null);
    onClose();
  };
  return (
    <div
      className={`cart-overlay${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        className="cart-scrim"
        aria-label="Đóng giỏ hàng"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartTitle"
        aria-hidden={!isOpen}
      >
        <div className="cart-head">
          <div>
            <span className="eyebrow eyebrow--plain">
              THƯỞNG THỨC MÓN NGON
            </span>
            <h2 id="cartTitle">
              Giỏ hàng <span className="cart-count">{cartCount}</span>
            </h2>
          </div>
          <button
            className="close-cart"
            aria-label="Đóng giỏ hàng"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {placed ? (
          <div className="cart-empty">
            <span>✅</span>
            <strong>Đặt món thành công!</strong>
            <p>
              Mã đơn <b>{placed.code}</b>. Nhà hàng đã nhận đơn và sẽ liên hệ
              bạn sớm.
            </p>
            <button
              className="button button--primary"
              onClick={closeAll}
              type="button"
            >
              Đóng
            </button>
          </div>
        ) : items.length > 0 && step === "checkout" ? (
          <form className="cart-footer checkout-form" onSubmit={submitOrder}>
            <div className="cart-total">
              <span>Cần thanh toán</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            {!customer && (
              <button className="text-link login-hint" onClick={onLoginRequest} type="button">
                Đăng nhập để lưu thông tin & xem lịch sử đơn →
              </button>
            )}
            <div className="field-grid"><input placeholder="Họ tên *" value={form.name} onChange={setField("name")} />
            <input placeholder="Số điện thoại *" value={form.phone} onChange={setField("phone")}             inputMode="tel" /></div>
            <input placeholder="Địa chỉ giao hàng *" value={form.address} onChange={setField("address")} />
            <input placeholder="Ghi chú" value={form.note} onChange={setField("note")} />
            <div className="pay-options">
              <label className={method === "transfer" ? "is-selected" : ""}>
                <input type="radio" checked={method === "transfer"} onChange={() => setMethod("transfer")} /> Chuyển khoản
              </label>
              <label className={method === "cod" ? "is-selected" : ""}>
                <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} /> Thanh toán khi nhận
              </label>
            </div>
            {method === "transfer" && (
              <div className="transfer-box">
                {bank.id && bank.account ? (
                  <>
                    <img
                      className="qr-img"
                      alt="Mã QR chuyển khoản"
                      src={`https://img.vietqr.io/image/${bank.id}-${bank.account}-compact.png?amount=${total}&addInfo=${encodeURIComponent(`Vinh Ky ${form.phone}`)}&accountName=${encodeURIComponent(bank.owner || "")}`}
                    />
                    <small>
                      {bank.id} · {bank.account} · {bank.owner}
                    </small>
                  </>
                ) : (
                  <small>Nhà hàng sẽ gửi thông tin chuyển khoản qua điện thoại.</small>
                )}
                <small>
                  Chuyển khoản đúng số tiền và nội dung, sau đó bấm &quot;Xác nhận đặt hàng&quot;. Nhà hàng sẽ đối soát và xác nhận thanh toán.
                </small>
              </div>
            )}
            {error && <small className="form-error" role="alert">{error}</small>}
            <button className="button button--primary checkout-button" disabled={busy} type="submit">
              {busy ? "Đang gửi..." : "Xác nhận đặt hàng"}
            </button>
            <button className="text-link" onClick={() => setStep("cart")} type="button">
              ← Quay lại giỏ hàng
            </button>
          </form>
        ) : items.length > 0 ? (
          <>
            <div className="cart-items">
              {items.map(([id, item]) => (
                <div className="cart-row" key={id}>
                  <strong>{item.name}</strong>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                  <div className="cart-row-controls">
                    <button
                      aria-label={`Giảm ${item.name}`}
                      onClick={() => onQuantityChange(id, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span>{item.quantity} phần</span>
                    <button
                      aria-label={`Tăng ${item.name}`}
                      onClick={() => onQuantityChange(id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      aria-label={`Xóa ${item.name}`}
                      onClick={() => onRemove(id)}
                      style={{ marginLeft: "auto" }}
                      type="button"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Tạm tính</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button
                className="button button--primary checkout-button"
                onClick={() => {
                  if (!customer) {
                    setError("Vui lòng đăng nhập để đặt món.");
                    onLoginRequest();
                    return;
                  }
                  setError("");
                  setStep("checkout");
                }}
                type="button"
              >
                Đặt món <span>↗</span>
              </button>
              {!customer && error && <small className="form-error" role="alert">{error}</small>}
              <small>
                Chọn chuyển khoản hoặc thanh toán khi nhận hàng ở bước tiếp theo.
              </small>
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <span>🛍️</span>
            <strong>Giỏ hàng đang trống</strong>
            <p>Chọn món ngon bạn yêu thích nhé!</p>
            <button
              className="button button--primary"
              onClick={onClose}
              type="button"
            >
              Khám phá thực đơn
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
