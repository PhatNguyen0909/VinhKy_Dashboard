import React, { useEffect, useMemo, useState } from 'react';
import './Revenue.css';

function Revenue() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [date, setDate] = useState(todayStr);
  const [chuyenKhoan, setChuyenKhoan] = useState('0');
  const [tienMat, setTienMat] = useState('0');

  const toNumber = (v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const total = useMemo(() => toNumber(chuyenKhoan) + toNumber(tienMat), [chuyenKhoan, tienMat]);

  const formatNumber = (n) => {
    try {
      return new Intl.NumberFormat('vi-VN').format(n || 0);
    } catch {
      return String(n || 0);
    }
  };

  const resetForm = () => {
    setDate(todayStr);
    setChuyenKhoan('0');
    setTienMat('0');
  };

  const API_URL = 'http://127.0.0.1:8000/api';

  // Tải dữ liệu doanh thu theo ngày (nếu đã có) để điền vào form
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${API_URL}/revenues`);
        if (!resp.ok) return;
        const list = await resp.json();
        const found = (list || []).find((r) => r.date === date);
        if (found && !cancelled) {
          setChuyenKhoan(String(found.chuyen_khoan ?? 0));
          setTienMat(String(found.tien_mat ?? 0));
        }
        if (!found && !cancelled) {
          setChuyenKhoan('0');
          setTienMat('0');
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date,
      chuyen_khoan: toNumber(chuyenKhoan),
      tien_mat: toNumber(tienMat),
    };

    try {
      // Try create first
      const resp = await fetch(`${API_URL}/revenues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        console.log('✅ Lưu doanh thu thành công');
        return;
      }
      // If already exists for this date, try to find and PATCH
      if (resp.status === 400) {
        const listResp = await fetch(`${API_URL}/revenues`);
        const list = await listResp.json();
        const found = (list || []).find((r) => r.date === date);
        if (found) {
          const patch = await fetch(`${API_URL}/revenues/${found.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (patch.ok) {
            console.log('✅ Cập nhật doanh thu thành công');
            return;
          }
        }
      }
      console.warn('⚠️ Không thể lưu doanh thu');
    } catch (err) {
      console.error('❌ Lỗi lưu doanh thu:', err);
    }
  };

  return (
    <div className="revenue-container">
      <h2>Doanh thu</h2>

      <form className="revenue-form" onSubmit={handleSubmit}>
        <div className="revenue-grid">
          <div className="field">
            <label>Ngày</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="field">
            <label>Tiền chuyển khoản</label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={chuyenKhoan}
              onChange={(e) => setChuyenKhoan(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Tiền mặt</label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={tienMat}
              onChange={(e) => setTienMat(e.target.value)}
            />
          </div>

          <div className="summary">
            <div className="summary-item">
              <span>Tổng doanh thu</span>
              <strong>{formatNumber(total)} đ</strong>
            </div>
          </div>

          <div className="actions">
            <button type="submit">Lưu</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Reset</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Revenue;
