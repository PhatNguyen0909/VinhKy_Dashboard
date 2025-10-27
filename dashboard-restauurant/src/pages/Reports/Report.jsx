
import React, { useEffect, useState } from 'react';
import './Report.css';

function Report() {
  const API_URL = 'http://127.0.0.1:8000/api';
  const [allItems, setAllItems] = useState([]); // all expense_items fetched once
  const [entries, setEntries] = useState([]); // entries grouped by date for the selected month
  const [openIdx, setOpenIdx] = useState(null);

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  useEffect(() => {
    // Fetch all expense items once
    fetch(`${API_URL}/expense_items`)
      .then((r) => {
        if (!r.ok) throw new Error('Không thể fetch expense items');
        return r.json();
      })
      .then((items) => {
        setAllItems(items || []);
      })
      .catch((err) => console.error('❌ Lỗi khi lấy dữ liệu báo cáo:', err));
  }, []);

  // Recompute entries whenever month or items change
  useEffect(() => {
    const filtered = (allItems || []).filter(
      (it) => (it.date || '').slice(0, 7) === selectedMonth
    );
    const map = {};
    filtered.forEach((it) => {
      const d = it.date || 'unknown';
      if (!map[d])
        map[d] = {
          date: d,
          tienNha: 0,
          tienGao: 0,
          tienCho: 0,
          tienKho: 0,
          tienGas: 0,
          tienDau: 0,
          tienTrung: 0,
          tienHop: 0,
          tienLuong: 0,
          tienGa: 0,
          tienKhac: 0,
        };
      map[d].tienNha += it.ha || 0;
      map[d].tienGao += it.gao || 0;
      map[d].tienCho += it.cho || 0;
      map[d].tienKho += it.kho || 0;
      map[d].tienGas += it.gas || 0;
      map[d].tienDau += it.dau || 0;
      map[d].tienTrung += it.trung || 0;
      map[d].tienHop += it.hop || 0;
      map[d].tienLuong += it.luong || 0;
      map[d].tienGa += it.ga || 0;
      map[d].tienKhac += it.khac || 0;
    });
    const arr = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    setEntries(arr);
    setOpenIdx(null); // reset any open item when month changes
  }, [allItems, selectedMonth]);

  const toggleOpen = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="dashboard-container">
      <h2>Báo cáo chi tiêu</h2>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <label>Chọn tháng:</label>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>
      <div className="expense-list">
        <h3>Danh sách chi tiêu</h3>
        <ul className="expense-collapsible-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {entries.map((entry, idx) => (
            <li key={idx} className="expense-collapsible-item" style={{ marginBottom: '20px' }}>
              <div
                className="expense-collapsible-header"
                onClick={() => toggleOpen(idx)}
                style={{ cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px' }}
              >
                {entry.date}
              </div>
              {openIdx === idx && (
                <div className="expense-collapsible-body">
                  <div className="table-horizontal">
                    <div className="col">
                      <th>Tiền Nhà</th>
                      <td>{entry.tienNha}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Gạo</th>
                      <td>{entry.tienGao}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Chợ</th>
                      <td>{entry.tienCho}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Khô</th>
                      <td>{entry.tienKho}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Gas</th>
                      <td>{entry.tienGas}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Dầu</th>
                      <td>{entry.tienDau}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Trứng</th>
                      <td>{entry.tienTrung}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Hộp</th>
                      <td>{entry.tienHop}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Lương</th>
                      <td>{entry.tienLuong}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Gà</th>
                      <td>{entry.tienGa}</td>
                    </div>
                    <div className="col">
                      <th>Tiền Khác</th>
                      <td>{entry.tienKhac}</td>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Report;
