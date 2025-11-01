
import React, { useEffect, useMemo, useState } from 'react';
import './Report.css';

function Report() {
  const API_URL = 'http://127.0.0.1:8000/api';

  // 1) Fetch tất cả expense items 1 lần
  const [allItems, setAllItems] = useState([]);
  const [openMonthIdx, setOpenMonthIdx] = useState(null);

  // Danh sách các mục chi tiêu để render gọn gàng
  const FIELDS = [
    { key: 'tienNha', label: 'Tiền Nhà' },
    { key: 'tienGao', label: 'Tiền Gạo' },
    { key: 'tienCho', label: 'Tiền Chợ' },
    { key: 'tienKho', label: 'Tiền Khô' },
    { key: 'tienGas', label: 'Tiền Gas' },
    { key: 'tienDau', label: 'Tiền Dầu' },
    { key: 'tienTrung', label: 'Trứng' },
    { key: 'tienHop', label: 'Tiền Hộp' },
    { key: 'tienLuong', label: 'Lương' },
    { key: 'tienGa', label: 'Tiền Gà' },
    { key: 'tienKhac', label: 'Tiền Khác' },
  ];

  useEffect(() => {
    fetch(`${API_URL}/expense_items`)
      .then((r) => {
        if (!r.ok) throw new Error('Không thể fetch expense items');
        return r.json();
      })
      .then((items) => setAllItems(items || []))
      .catch((err) => console.error('❌ Lỗi khi lấy dữ liệu báo cáo:', err));
  }, []);

  // 2) Gom theo tháng, và trong mỗi tháng gom tiếp theo ngày
  const monthEntries = useMemo(() => {
    const toNum = (v) => (typeof v === 'number' ? v : Number(v || 0));
    const monthsMap = {};

    (allItems || []).forEach((it) => {
      const date = it?.date || '';
      if (!date) return; // bỏ qua record không có ngày
      const month = date.slice(0, 7); // YYYY-MM

      if (!monthsMap[month]) {
        monthsMap[month] = {
          month,
          totals: {
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
          },
          days: {},
        };
      }

      const m = monthsMap[month];
      // Cộng vào tổng tháng
      m.totals.tienNha += toNum(it.ha);
      m.totals.tienGao += toNum(it.gao);
      m.totals.tienCho += toNum(it.cho);
      m.totals.tienKho += toNum(it.kho);
      m.totals.tienGas += toNum(it.gas);
      m.totals.tienDau += toNum(it.dau);
      m.totals.tienTrung += toNum(it.trung);
      m.totals.tienHop += toNum(it.hop);
      m.totals.tienLuong += toNum(it.luong);
      m.totals.tienGa += toNum(it.ga);
      m.totals.tienKhac += toNum(it.khac);

      // Cộng vào tổng ngày
      if (!m.days[date]) {
        m.days[date] = {
          date,
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
      }
      const d = m.days[date];
      d.tienNha += toNum(it.ha);
      d.tienGao += toNum(it.gao);
      d.tienCho += toNum(it.cho);
      d.tienKho += toNum(it.kho);
      d.tienGas += toNum(it.gas);
      d.tienDau += toNum(it.dau);
      d.tienTrung += toNum(it.trung);
      d.tienHop += toNum(it.hop);
      d.tienLuong += toNum(it.luong);
      d.tienGa += toNum(it.ga);
      d.tienKhac += toNum(it.khac);
    });

    // Chuyển sang array, sắp xếp tháng mới nhất lên trước; ngày tăng dần
    const monthsArr = Object.values(monthsMap)
      .map((m) => ({
        month: m.month,
        totals: m.totals,
        days: Object.values(m.days).sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return monthsArr;
  }, [allItems]);

  const toggleOpenMonth = (idx) => {
    setOpenMonthIdx(openMonthIdx === idx ? null : idx);
  };

  const formatNumber = (n) => {
    try {
      return new Intl.NumberFormat('vi-VN').format(n || 0);
    } catch {
      return n || 0;
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Báo cáo chi tiêu</h2>
      <div className="expense-list">
        <ul className="expense-collapsible-list" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {monthEntries.length === 0 && (
            <li style={{ padding: 12, color: '#666' }}>Không có dữ liệu</li>
          )}
          {monthEntries.map((m, idx) => (
            <li key={m.month} className="expense-collapsible-item" style={{ marginBottom: 20 }}>
              <div
                className="expense-collapsible-header"
                onClick={() => toggleOpenMonth(idx)}
                style={{ cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px solid #ccc', textAlign: 'center', padding: 8 }}
              >
                {m.month}
              </div>
              
                  <div className="table-horizontal" style={{ marginBottom: 16 }}>
                    {FIELDS.map((f) => (
                      <div className="col" key={f.key}>
                        <th>{f.label}</th>
                        <td>{formatNumber(m.totals[f.key])}</td>
                      </div>
                    ))}
                  </div>
              {openMonthIdx === idx && (
                
                <div className="expense-collapsible-body" style={{ paddingTop: 12 }}>

                  <div style={{ fontWeight: '600', margin: '12px 0 8px' }}>Chi tiết theo ngày</div>
                  {m.days.map((d) => (
                    <div key={d.date} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 6 }}>
                      <div className="expense-collapsible-header" style={{ textAlign: 'center', padding: 8, background: '#fafafa', borderBottom: '1px solid #eee' }}>
                        {d.date}
                      </div>
                      <div className="expense-collapsible-body" style={{ paddingTop: 8 }}>
                        <div className="table-horizontal">
                          {FIELDS.map((f) => (
                            <div className="col" key={f.key}>
                              <th>{f.label}</th>
                              <td>{formatNumber(d[f.key])}</td>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
