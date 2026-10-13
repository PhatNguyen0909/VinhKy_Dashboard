import { useEffect, useState } from "react";
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

  const bank = {
    id: import.meta.env.VITE_BANK_ID,
    account: import.meta.env.VITE_BANK_ACCOUNT,
    owner: import.meta.env.VITE_BANK_OWNER,
  };
  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Vui lòng nhập tên và số điện thoại.");
      return;
    }
    if (method === "cod" && !form.address.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
          payment_method: method,
          payment_status: method === "transfer" ? "paid" : "unpaid",
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
          <form className="cart-footer" onSubmit={submitOrder}>
            <div className="cart-total">
              <span>Cần thanh toán</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <input placeholder="Họ tên *" value={form.name} onChange={setField("name")} />
            <input placeholder="Số điện thoại *" value={form.phone} onChange={setField("phone")} inputMode="tel" />
            <input placeholder="Địa chỉ giao hàng" value={form.address} onChange={setField("address")} />
            <input placeholder="Ghi chú" value={form.note} onChange={setField("note")} />
            <label>
              <input type="radio" checked={method === "transfer"} onChange={() => setMethod("transfer")} /> Chuyển khoản
            </label>
            <label>
              <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} /> Thanh toán khi nhận hàng
            </label>
            {method === "transfer" && (
              <div>
                {bank.id && bank.account ? (
                  <>
                    <img
                      alt="Mã QR chuyển khoản"
                      style={{ width: "100%", maxWidth: 260 }}
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
                  Sau khi chuyển khoản xong, bấm &quot;Tôi đã chuyển khoản&quot; để nhà hàng nhận đơn.
                </small>
              </div>
            )}
            {error && <small role="alert">{error}</small>}
            <button className="button button--primary checkout-button" disabled={busy} type="submit">
              {busy ? "Đang gửi..." : method === "transfer" ? "Tôi đã chuyển khoản" : "Đặt hàng"}
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
                onClick={() => setStep("checkout")}
                type="button"
              >
                Đặt món <span>↗</span>
              </button>
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
