import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };

function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      setItems(await res.json());
    } catch {
      setError('Không tải được danh mục');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ name: name.trim() }),
    });
    setName('');
    load();
  };

  const save = async (id) => {
    if (!editName.trim()) return;
    await fetch(`${API_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditId(null);
    load();
  };

  const remove = async (c) => {
    if (!window.confirm(`Xóa danh mục "${c.name}" và toàn bộ món bên trong?`)) return;
    await fetch(`${API_URL}/categories/${c.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <main className='wsite'>
      <div className='wsite-head'>
        <h1>Danh mục</h1>
      </div>
      <form className='wsite-card wsite-row' onSubmit={add}>
        <input
          placeholder='Tên danh mục mới'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className='btn primary' type='submit'>
          Thêm
        </button>
      </form>
      {error && <p>{error}</p>}
      <div className='wsite-card'>
        {items.length === 0 && <p>Chưa có danh mục.</p>}
        {items.map((c) => (
          <div className='wsite-row' key={c.id}>
            {editId === c.id ? (
              <>
                <input
                  className='grow'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button className='btn ok' onClick={() => save(c.id)}>
                  Lưu
                </button>
                <button className='btn' onClick={() => setEditId(null)}>
                  Hủy
                </button>
              </>
            ) : (
              <>
                <strong className='grow'>{c.name}</strong>
                <button
                  className='btn'
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                >
                  Sửa
                </button>
                <button className='btn danger' onClick={() => remove(c)}>
                  Xóa
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default Categories;
