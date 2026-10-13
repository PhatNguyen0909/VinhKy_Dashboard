import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };
const empty = {
  category_id: '',
  name: '',
  description: '',
  price: 0,
  rating: 5,
  is_best_seller: false,
  image: '',
};

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const money = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';

function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([
        fetch(`${API_URL}/categories`).then((r) => r.json()),
        fetch(`${API_URL}/products`).then((r) => r.json()),
      ]);
      setCategories(c);
      setProducts(p);
    } catch {
      setError('Không tải được dữ liệu món ăn');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.name.trim()) {
      setError('Chọn danh mục và nhập tên món');
      return;
    }
    const body = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price) || 0,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
      is_best_seller: form.is_best_seller,
      image: form.image,
    };
    const res = await fetch(
      form.id ? `${API_URL}/products/${form.id}` : `${API_URL}/products`,
      { method: form.id ? 'PATCH' : 'POST', headers: json, body: JSON.stringify(body) }
    );
    if (!res.ok) {
      setError('Lưu thất bại');
      return;
    }
    setError('');
    setForm(null);
    load();
  };

  const remove = async (p) => {
    if (!window.confirm(`Xóa món "${p.name}"?`)) return;
    await fetch(`${API_URL}/products/${p.id}`, { method: 'DELETE' });
    load();
  };

  const shown = products.filter((p) => !filter || String(p.category_id) === filter);
  const catName = (id) => categories.find((c) => c.id === id)?.name || '';

  return (
    <main className='wsite'>
      <div className='wsite-head'>
        <h1>Món ăn</h1>
        <div className='wsite-actions'>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value=''>Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className='btn primary'
            onClick={() => setForm({ ...empty, category_id: filter || categories[0]?.id || '' })}
          >
            + Thêm món
          </button>
        </div>
      </div>
      {error && <p>{error}</p>}

      {form && (
        <form className='wsite-card wsite-form' onSubmit={submit}>
          <label>
            Danh mục
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value=''>-- Chọn --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tên món
            <input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            Giá (đ)
            <input type='number' min='0' value={form.price} onChange={(e) => set('price', e.target.value)} />
          </label>
          <label>
            Số sao (0-5)
            <input
              type='number'
              min='0'
              max='5'
              step='0.1'
              value={form.rating}
              onChange={(e) => set('rating', e.target.value)}
            />
          </label>
          <label className='full'>
            Mô tả
            <textarea rows='3' value={form.description} onChange={(e) => set('description', e.target.value)} />
          </label>
          <label>
            Hình ảnh (tải lên)
            <input
              type='file'
              accept='image/*'
              onChange={async (e) => {
                const f = e.target.files[0];
                if (f) set('image', await resizeImage(f));
              }}
            />
          </label>
          <label>
            Hoặc dán link ảnh
            <input
              value={form.image.startsWith('data:') ? '' : form.image}
              onChange={(e) => set('image', e.target.value)}
            />
          </label>
          {form.image && (
            <img src={form.image} alt='' style={{ height: 100, borderRadius: 8 }} />
          )}
          <label className='check full'>
            <input
              type='checkbox'
              checked={form.is_best_seller}
              onChange={(e) => set('is_best_seller', e.target.checked)}
            />
            Đánh dấu Best Seller
          </label>
          <div className='wsite-actions full'>
            <button className='btn primary' type='submit'>
              {form.id ? 'Lưu thay đổi' : 'Thêm món'}
            </button>
            <button className='btn' type='button' onClick={() => setForm(null)}>
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className='wsite-grid'>
        {shown.map((p) => (
          <div className='dish' key={p.id}>
            {p.image ? <img src={p.image} alt={p.name} /> : <div className='noimg' />}
            <div className='dish-body'>
              <strong>{p.name}</strong>
              <small>{catName(p.category_id)}</small>
              <span>
                <span className='stars'>★</span> {Number(p.rating).toFixed(1)} · {money(p.price)}
              </span>
              {p.is_best_seller && <span className='tag'>BEST SELLER</span>}
              <p>{p.description}</p>
              <div className='wsite-actions'>
                <button className='btn' onClick={() => setForm({ ...p, category_id: String(p.category_id) })}>
                  Sửa
                </button>
                <button className='btn danger' onClick={() => remove(p)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p>Chưa có món nào.</p>}
      </div>
    </main>
  );
}

export default Menu;
