import { useCallback, useEffect, useMemo, useState } from 'react';
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
  is_available: true,
  image: '',
};
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

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
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Không thể xử lý hình ảnh.'));
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(null);

  const load = useCallback(async () => {
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`),
      ]);
      if (!categoryResponse.ok || !productResponse.ok) {
        throw new Error('Không tải được thực đơn');
      }
      const [categoryData, productData] = await Promise.all([
        categoryResponse.json(),
        productResponse.json(),
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setError('');
    } catch {
      setError('Không tải được dữ liệu món ăn. Vui lòng thử lại.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return products.filter((product) => {
      const matchesCategory = !filter || String(product.category_id) === filter;
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase('vi').includes(query) ||
        (product.description || '').toLocaleLowerCase('vi').includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [filter, products, search]);
  const catalogValue = products.reduce((total, product) => total + Number(product.price || 0), 0);
  const categoryName = (id) => categories.find((category) => category.id === id)?.name || 'Chưa phân loại';

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const openForm = (product = null) => {
    setError('');
    setForm(
      product
        ? { ...empty, ...product, category_id: String(product.category_id) }
        : { ...empty, category_id: filter || String(categories[0]?.id || '') }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.category_id || !form.name.trim()) {
      setError('Vui lòng chọn danh mục và nhập tên món.');
      return;
    }

    const body = {
      category_id: Number(form.category_id),
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price) || 0,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
      is_best_seller: form.is_best_seller,
      is_available: form.is_available !== false,
      image: form.image,
    };
    setSaving(true);
    try {
      const response = await fetch(
        form.id ? `${API_URL}/products/${form.id}` : `${API_URL}/products`,
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: json,
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) throw new Error('Không thể lưu món ăn.');
      setForm(null);
      await load();
    } catch {
      setError('Lưu món ăn thất bại. Vui lòng kiểm tra dữ liệu và thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Xóa món "${product.name}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Không thể xóa món ăn.');
      await load();
    } catch {
      setError('Xóa món ăn thất bại. Vui lòng thử lại.');
    }
  };

  const toggleAvailability = async (product) => {
    if (availabilitySaving === product.id) return;
    const isAvailable = product.is_available === false;
    setAvailabilitySaving(product.id);
    setError('');
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PATCH',
        headers: json,
        body: JSON.stringify({ is_available: isAvailable }),
      });
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái món ăn.');
      await load();
    } catch {
      setError('Không thể cập nhật trạng thái món ăn. Vui lòng thử lại.');
    } finally {
      setAvailabilitySaving(null);
    }
  };

  return (
    <main className='wsite'>
      <header className='wsite-page-head'>
        <div>
          <span className='wsite-eyebrow'>THỰC ĐƠN NHÀ HÀNG</span>
          <h1>Món ăn</h1>
        </div>
        <button
          className='btn primary'
          onClick={() => openForm()}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Hãy tạo danh mục trước' : undefined}
        >
          <span aria-hidden='true'>＋</span> Thêm món ăn
        </button>
      </header>

      <section className='wsite-stats' aria-label='Tổng quan món ăn'>
        <article className='wsite-stat'>
          <span>Tổng món ăn</span>
          <strong>{products.length}</strong>
          <small>Trong thực đơn</small>
        </article>
        <article className='wsite-stat'>
          <span>Đang bán</span>
          <strong>{products.filter((product) => product.is_available !== false).length}</strong>
          <small>Sẵn sàng để khách đặt</small>
        </article>
        <article className='wsite-stat'>
          <span>Tổng giá niêm yết</span>
          <strong>{money(catalogValue)}</strong>
          <small>Tổng giá các món</small>
        </article>
      </section>

      <section className='wsite-table-card'>
        <div className='wsite-table-head'>
          <div>
            <h2>Danh sách món ăn</h2>
            <p>Quản lý món ăn, danh mục và giá bán</p>
          </div>
          <div className='wsite-table-tools'>
            <label className='wsite-search'>
              <span aria-hidden='true'>⌕</span>
              <input
                aria-label='Tìm món ăn'
                placeholder='Tìm món ăn'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              className='wsite-filter'
              aria-label='Lọc theo danh mục'
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value=''>Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className='wsite-error' role='alert'>{error}</p>}
        {categories.length === 0 && (
          <p className='wsite-notice'>Bạn cần tạo danh mục trước khi thêm món ăn.</p>
        )}
        <div className='wsite-table-scroll'>
          <table className='wsite-table product-table'>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên món</th>
                <th>Danh mục</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Giá</th>
                <th>Đánh giá</th>
                <th aria-label='Thao tác' />
              </tr>
            </thead>
            <tbody>
              {shown.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.image
                      ? <img className='wsite-product-thumb' src={product.image} alt='' />
                      : <span className='wsite-product-thumb wsite-product-placeholder'>🍽</span>}
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <small>MA-{String(product.id).padStart(3, '0')}</small>
                  </td>
                  <td>{categoryName(product.category_id)}</td>
                  <td className='wsite-description-cell'>{product.description || '—'}</td>
                  <td>
                    <button
                      className={`wsite-status-button ${product.is_available === false ? 'is-unavailable' : 'is-available'}`}
                      onClick={() => toggleAvailability(product)}
                      disabled={availabilitySaving === product.id}
                      aria-label={`Đổi trạng thái ${product.name} sang ${product.is_available === false ? 'đang bán' : 'ngưng bán'}`}
                      title='Bấm để đổi trạng thái bán'
                    >
                      {availabilitySaving === product.id
                        ? 'Đang cập nhật...'
                        : product.is_available === false ? 'Ngưng bán' : 'Đang bán'}
                    </button>
                  </td>
                  <td><strong>{money(product.price)}</strong></td>
                  <td><span className='wsite-rating'>★</span> {Number(product.rating || 0).toFixed(1)}</td>
                  <td>
                    <div className='wsite-icon-actions'>
                      <button
                        className='wsite-icon-button'
                        onClick={() => openForm(product)}
                        aria-label={`Sửa món ${product.name}`}
                        title='Sửa'
                      >
                        ✎
                      </button>
                      <button
                        className='wsite-icon-button is-danger'
                        onClick={() => remove(product)}
                        aria-label={`Xóa món ${product.name}`}
                        title='Xóa'
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td className='wsite-empty' colSpan='8'>
                    {products.length ? 'Không tìm thấy món ăn phù hợp.' : 'Chưa có món ăn.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className='wsite-table-footer'>
          Hiển thị {shown.length} / {products.length} món ăn
          <span>Thực đơn nhà hàng · Đang hoạt động</span>
        </footer>
      </section>

      {form && (
        <div className='wsite-modal-backdrop' onMouseDown={(event) => {
          if (event.target === event.currentTarget) setForm(null);
        }}>
          <section
            className='wsite-modal product-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='product-modal-title'
          >
            <div className='wsite-modal-head'>
              <div>
                <span className='wsite-eyebrow'>THÔNG TIN MÓN ĂN</span>
                <h2 id='product-modal-title'>{form.id ? 'Chỉnh sửa món ăn' : 'Thêm món ăn'}</h2>
              </div>
              <button className='wsite-modal-close' onClick={() => setForm(null)} aria-label='Đóng'>×</button>
            </div>
            <form className='wsite-product-form' onSubmit={submit}>
              <label className='wsite-field full'>
                Danh mục
                <select
                  value={form.category_id}
                  onChange={(event) => set('category_id', event.target.value)}
                  required
                >
                  <option value=''>-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className='wsite-field full'>
                Tên món
                <input
                  autoFocus
                  maxLength='200'
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder='Nhập tên món'
                  required
                />
              </label>
              <label className='wsite-field full'>
                Mô tả
                <textarea
                  rows='3'
                  value={form.description || ''}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder='Mô tả thành phần hoặc hương vị'
                />
              </label>
              <label className='wsite-field full'>
                Link hình ảnh
                <input
                  value={form.image?.startsWith('data:') ? '' : form.image || ''}
                  onChange={(event) => set('image', event.target.value)}
                  placeholder='https://...'
                />
              </label>
              <label className='wsite-field full'>
                Hoặc tải hình ảnh lên
                <input
                  type='file'
                  accept='image/*'
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError('');
                    try {
                      const dataUrl = await resizeImage(file);
                      const response = await fetch(`${API_URL}/uploads/image`, {
                        method: 'POST',
                        headers: json,
                        body: JSON.stringify({ image: dataUrl }),
                      });
                      if (!response.ok) {
                        const detail = await response.json().catch(() => ({}));
                        throw new Error(detail.detail || 'Tải ảnh lên thất bại.');
                      }
                      const { url } = await response.json();
                      set('image', url);
                    } catch (uploadError) {
                      setError(uploadError.message || 'Không tải được ảnh. Vui lòng thử lại.');
                    } finally {
                      setUploading(false);
                      event.target.value = '';
                    }
                  }}
                />
                {uploading && <small>Đang tải ảnh lên Cloudinary...</small>}
              </label>
              {form.image && (
                <div className='wsite-image-preview'>
                  <img src={form.image} alt={`Xem trước ${form.name || 'món ăn'}`} />
                </div>
              )}
              <label className='wsite-field'>
                Giá bán (đ)
                <input
                  type='number'
                  min='0'
                  step='1000'
                  value={form.price}
                  onChange={(event) => set('price', event.target.value)}
                  required
                />
              </label>
              <label className='wsite-field'>
                Đánh giá (0–5)
                <input
                  type='number'
                  min='0'
                  max='5'
                  step='0.1'
                  value={form.rating}
                  onChange={(event) => set('rating', event.target.value)}
                />
              </label>
              <label className='wsite-check-field full'>
                <input
                  type='checkbox'
                  checked={Boolean(form.is_best_seller)}
                  onChange={(event) => set('is_best_seller', event.target.checked)}
                />
                Đánh dấu Best Seller
              </label>
              {error && <p className='wsite-error full' role='alert'>{error}</p>}
              <div className='wsite-modal-actions full'>
                <button className='btn' type='button' onClick={() => setForm(null)}>Hủy</button>
                <button className='btn primary' type='submit' disabled={saving || uploading || categories.length === 0}>
                  {saving ? 'Đang lưu...' : form.id ? 'Lưu thay đổi' : 'Thêm món ăn'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Menu;
