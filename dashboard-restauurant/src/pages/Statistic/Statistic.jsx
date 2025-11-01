import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Statistic.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://127.0.0.1:8000/api';

function Statistic() {
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonth);
  const [rows, setRows] = useState([]); // [{date, revenue, expense, profit}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (m) => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_URL}/profits?month=${encodeURIComponent(m)}`);
      if (!resp.ok) throw new Error('Không thể tải dữ liệu lợi nhuận');
      const data = await resp.json();
      setRows(data || []);
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(month); }, [month]);

  const labels = useMemo(() => rows.map(r => (r.date || '').slice(8, 10)), [rows]);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: rows.map(r => r.revenue || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.6)', // green
      },
      {
        label: 'Chi phí',
        data: rows.map(r => r.expense || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // red
      },
      {
        label: 'Lợi nhuận',
        data: rows.map(r => r.profit || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
      },
    ],
  }), [labels, rows]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Lợi nhuận theo ngày tháng ${month}` },
      tooltip: {
        callbacks: {
          label(ctx) {
            const value = ctx.parsed.y ?? 0;
            try { return `${ctx.dataset.label}: ${new Intl.NumberFormat('vi-VN').format(value)} đ`; } catch { return `${ctx.dataset.label}: ${value}`; }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback(value) {
            try { return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value); } catch { return value; }
          },
        },
      },
    },
  }), [month]);

  const formatNumber = (n) => {
    try { return new Intl.NumberFormat('vi-VN').format(n || 0); } catch { return String(n || 0); }
  };

  const totals = useMemo(() => {
    const rev = rows.reduce((s, r) => s + (r.revenue || 0), 0);
    const exp = rows.reduce((s, r) => s + (r.expense || 0), 0);
    const pro = rows.reduce((s, r) => s + (r.profit || 0), 0);
    return { rev, exp, pro };
  }, [rows]);

  return (
    <div className="statistic-container">
      <div className="statistic-header">
        <h2>Thống kê lợi nhuận</h2>
        <div className="tools">
          <label>Chọn tháng:</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {error && <div className="statistic-error">{error}</div>}

      <div className="chart-card">
        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="summary-row">
          <div className="summary-item" style={{ color: '#16a34a' }}>Tổng doanh thu: <strong>{formatNumber(totals.rev)} đ</strong></div>
          <div className="summary-item" style={{ color: '#ef4444' }}>Tổng chi phí: <strong>{formatNumber(totals.exp)} đ</strong></div>
          <div className="summary-item" style={{ color: '#3b82f6' }}>Tổng lợi nhuận: <strong>{formatNumber(totals.pro)} đ</strong></div>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Doanh thu</th>
              <th>Chi phí</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Đang tải...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4}>Không có dữ liệu</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(r.revenue)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(r.expense)}</td>
                  <td style={{ textAlign: 'right', color: (r.profit||0) < 0 ? '#ef4444' : '#16a34a' }}>{formatNumber(r.profit)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ fontWeight: 600 }}>Tổng</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(totals.rev)}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(totals.exp)}</td>
              <td style={{ textAlign: 'right', fontWeight: 600, color: totals.pro < 0 ? '#ef4444' : '#16a34a' }}>{formatNumber(totals.pro)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Statistic;
