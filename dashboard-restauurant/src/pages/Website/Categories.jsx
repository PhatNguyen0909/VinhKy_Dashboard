import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };

function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`),
      ]);
      if (!categoryResponse.ok || !productResponse.ok) {
        throw new Error('Không tải được dữ liệu danh mục');
      }
      const [categoryData, productData] = await Promise.all([
        categoryResponse.json(),
        productResponse.json(),
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setError('');
    } catch {
      setError('Không tải được danh mục và món ăn. Vui lòng thử lại.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
      ),
    [categories, search]
  );
  const associatedProducts = modal
    ? products.filter((product) => product.category_id === modal.id)
    : [];

  const openModal = (category = null) => {
    setModal(category ? { id: category.id } : { id: null });
    setName(category?.name || '');
    setError('');
  };

  const closeModal = () => {
    setModal(null);
    setName('');
  };

  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        modal.id ? `${API_URL}/categories/${modal.id}` : `${API_URL}/categories`,
        {
          method: modal.id ? 'PATCH' : 'POST',
          headers: json,
          body: JSON.stringify({ name: name.trim() }),
        }
      );
      if (!response.ok) throw new Error('Không thể lưu danh mục.');
      await load();
      closeModal();
    } catch {
      setError('Lưu danh mục thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`Xóa danh mục "${category.name}" và toàn bộ món bên trong?`)) return;
    try {
      const response = await fetch(`${API_URL}/categories/${category.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Không thể xóa danh mục.');
      await load();
    } catch {
      setError('Xóa danh mục thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <main className='wsite'>
      <header className='wsite-page-head'>
        <div>
          <span className='wsite-eyebrow'>QUẢN LÝ THỰC ĐƠN</span>
          <h1>Danh mục</h1>
        </div>
        <button className='btn primary' onClick={() => openModal()}>
          <span aria-hidden='true'>＋</span> Thêm danh mục
        </button>
      </header>

      <section className='wsite-stats' aria-label='Tổng quan danh mục'>
        <article className='wsite-stat'>
          <span>Tổng danh mục</span>
          <strong>{categories.length}</strong>
          <small>Trong thực đơn</small>
        </article>
        <article className='wsite-stat'>
          <span>Đang sử dụng</span>
          <strong>{categories.length}</strong>
          <small>Danh mục hiện có</small>
        </article>
        <article className='wsite-stat'>
          <span>Tổng món ăn</span>
          <strong>{products.length}</strong>
          <small>Trong tất cả danh mục</small>
        </article>
      </section>

      <section className='wsite-table-card'>
        <div className='wsite-table-head'>
          <div>
            <h2>Danh sách danh mục</h2>
            <p>Phân nhóm món ăn để khách dễ dàng lựa chọn</p>
          </div>
          <label className='wsite-search'>
            <span aria-hidden='true'>⌕</span>
            <input
              aria-label='Tìm danh mục'
              placeholder='Tìm danh mục'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {error && <p className='wsite-error' role='alert'>{error}</p>}
        <div className='wsite-table-scroll'>
          <table className='wsite-table category-table'>
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Món ăn đi kèm</th>
                <th>Trạng thái</th>
                <th aria-label='Thao tác' />
              </tr>
            </thead>
            <tbody>
              {shown.map((category, index) => {
                const count = products.filter(
                  (product) => product.category_id === category.id
                ).length;
                return (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      <small>DM-{String(index + 1).padStart(3, '0')}</small>
                    </td>
                    <td>
                      <button
                        className='wsite-text-action'
                        onClick={() => openModal(category)}
                        aria-label={`Xem món ăn trong danh mục ${category.name}`}
                      >
                        {count} món ăn · Xem danh sách
                      </button>
                    </td>
                    <td><span className='wsite-status is-active'>Đang dùng</span></td>
                    <td>
                      <div className='wsite-icon-actions'>
                        <button
                          className='wsite-icon-button'
                          onClick={() => openModal(category)}
                          aria-label={`Sửa danh mục ${category.name}`}
                          title='Sửa'
                        >
                          ✎
                        </button>
                        <button
                          className='wsite-icon-button is-danger'
                          onClick={() => remove(category)}
                          aria-label={`Xóa danh mục ${category.name}`}
                          title='Xóa'
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr><td className='wsite-empty' colSpan='4'>Không tìm thấy danh mục.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className='wsite-table-footer'>
          Hiển thị {shown.length} / {categories.length} danh mục
          <span>Thực đơn nhà hàng · Đang hoạt động</span>
        </footer>
      </section>

      {modal && (
        <div className='wsite-modal-backdrop' onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <section
            className='wsite-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='category-modal-title'
          >
            <div className='wsite-modal-head'>
              <div>
                <span className='wsite-eyebrow'>THÔNG TIN DANH MỤC</span>
                <h2 id='category-modal-title'>
                  {modal.id ? 'Cập nhật danh mục' : 'Thêm danh mục'}
                </h2>
              </div>
              <button className='wsite-modal-close' onClick={closeModal} aria-label='Đóng'>×</button>
            </div>
            <form onSubmit={save}>
              <label className='wsite-field'>
                Tên danh mục
                <input
                  autoFocus
                  maxLength='120'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder='Ví dụ: Món chính'
                />
              </label>
              <div className='wsite-associated-list'>
                <div className='wsite-associated-head'>
                  <strong>Món ăn thuộc danh mục</strong>
                  <span>{associatedProducts.length} món</span>
                </div>
                {associatedProducts.length > 0 ? (
                  <ul>
                    {associatedProducts.map((product) => (
                      <li key={product.id}>
                        {product.image && <img src={product.image} alt='' />}
                        <span>{product.name}</span>
                        <small>{new Intl.NumberFormat('vi-VN').format(product.price)}đ</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='wsite-associated-empty'>
                    Danh mục chưa có món ăn. Bạn có thể gán món trong mục Món ăn.
                  </p>
                )}
              </div>
              {error && <p className='wsite-error' role='alert'>{error}</p>}
              <div className='wsite-modal-actions'>
                <button className='btn' type='button' onClick={closeModal}>Hủy</button>
                <button className='btn primary' type='submit' disabled={saving}>
                  {saving ? 'Đang lưu...' : modal.id ? 'Lưu thay đổi' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Categories;
