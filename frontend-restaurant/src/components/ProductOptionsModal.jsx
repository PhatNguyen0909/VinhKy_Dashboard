import { useEffect, useState } from 'react';
import { formatPrice } from './ProductCard.jsx';

export default function ProductOptionsModal({
  product,
  addOns,
  onClose,
  onConfirm,
}) {
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const selectedAddOns = addOns.filter((item) => selected[item.id]);
  const total =
    product.price * quantity +
    selectedAddOns.reduce((sum, item) => sum + item.price * quantity, 0);

  return (
    <div
      className='product-options-overlay'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className='product-options-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='product-options-title'
      >
        {product.image && (
          <img
            className='product-options-image'
            src={product.image}
            alt={product.imageDescription || product.name}
          />
        )}
        <div className='product-options-heading'>
          <div>
            <span className='eyebrow eyebrow--plain'>TÙY CHỌN MÓN</span>
            <h2 id='product-options-title'>{product.name}</h2>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <button
            className='close-cart'
            aria-label='Đóng'
            onClick={onClose}
            type='button'
          >
            ×
          </button>
        </div>

        <label className='product-options-label'>
          Ghi chú cho món này
          <textarea
            rows='3'
            maxLength='300'
            placeholder='Ví dụ: ít cay, không hành... , Ngoài ra nếu chọn nước uống thì vui lòng ghi chú loại nước ạ.'
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className='product-options-quantity'>
          <span>Số lượng món chính</span>
          <div className='cart-row-controls'>
            <button
              aria-label='Giảm số lượng'
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              type='button'
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              aria-label='Tăng số lượng'
              onClick={() => setQuantity((value) => value + 1)}
              type='button'
            >
              +
            </button>
          </div>
        </div>

        <fieldset className='product-addon-list'>
          <legend>
            Món ăn kèm <small>(có thể chọn nhiều món)</small>
          </legend>
          {addOns.length === 0 ? (
            <p>Hiện chưa có món thêm hoặc nước uống.</p>
          ) : (
            addOns.map((item) => (
              <label className='product-addon-option' key={item.id}>
                <input
                  type='checkbox'
                  checked={Boolean(selected[item.id])}
                  onChange={(event) =>
                    setSelected((current) => ({
                      ...current,
                      [item.id]: event.target.checked,
                    }))
                  }
                />
                <span>{item.name}</span>
                <strong>{formatPrice(item.price)}</strong>
              </label>
            ))
          )}
        </fieldset>

        <div className='product-options-footer'>
          <span>
            Tạm tính <strong>{formatPrice(total)}</strong>
          </span>
          <button
            className='button button--primary'
            onClick={() =>
              onConfirm({ note: note.trim(), quantity, addOns: selectedAddOns })
            }
            type='button'
          >
            Thêm vào giỏ
          </button>
        </div>
      </section>
    </div>
  );
}
