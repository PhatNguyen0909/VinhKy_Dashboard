import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const monthValue = (date) => (date || '').slice(0, 7);
const toMonth = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const sumByMonth = (records, month, field) =>
  records.reduce((sum, record) => sum + (monthValue(record.date) === month ? Number(record[field] || 0) : 0), 0);

function Dashboard() {
  const todayMonth = toMonth(new Date());
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState(todayMonth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${API_URL}/revenues`).then((response) => {
        if (!response.ok) throw new Error('Không thể tải doanh thu.');
        return response.json();
      }),
      fetch(`${API_URL}/expenses`).then((response) => {
        if (!response.ok) throw new Error('Không thể tải chi phí.');
        return response.json();
      }),
    ])
      .then(([revenueRows, expenseRows]) => {
        if (!active) return;
        setRevenues(revenueRows || []);
        setExpenses(expenseRows || []);
        const availableMonths = [...(revenueRows || []), ...(expenseRows || [])]
          .map((row) => monthValue(row.date))
          .filter(Boolean)
          .sort();
        if (availableMonths.length && !availableMonths.includes(todayMonth)) {
          setMonth(availableMonths[availableMonths.length - 1]);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải dữ liệu tổng quan.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [todayMonth]);

  const selectedYear = Number(month.slice(0, 4));
  const previousDate = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 2, 1);
  const previousMonth = toMonth(previousDate);

  const totals = useMemo(() => {
    const revenue = sumByMonth(revenues, month, 'total');
    const expense = sumByMonth(expenses, month, 'amount');
    const priorRevenue = sumByMonth(revenues, previousMonth, 'total');
    const priorExpense = sumByMonth(expenses, previousMonth, 'amount');
    return {
      revenue,
      expense,
      profit: revenue - expense,
      revenueTrend: priorRevenue ? ((revenue - priorRevenue) / priorRevenue) * 100 : null,
      expenseTrend: priorExpense ? ((expense - priorExpense) / priorExpense) * 100 : null,
    };
  }, [revenues, expenses, month, previousMonth]);

  const yearlyChart = useMemo(() => {
    const yearRows = (records, field) => monthNames.map((_, index) =>
      records.reduce((sum, row) => {
        if ((row.date || '').slice(0, 4) !== String(selectedYear)) return sum;
        return Number(row.date.slice(5, 7)) === index + 1 ? sum + Number(row[field] || 0) : sum;
      }, 0)
    );
    return {
      labels: monthNames,
      datasets: [
        { label: 'Doanh thu', data: yearRows(revenues, 'total'), backgroundColor: '#315f4e', borderRadius: 3, barPercentage: 0.55 },
        { label: 'Chi phí', data: yearRows(expenses, 'amount'), backgroundColor: '#c9df66', borderRadius: 3, barPercentage: 0.55 },
      ],
    };
  }, [revenues, expenses, selectedYear]);

  const revenueSplit = useMemo(() => ({
    cash: sumByMonth(revenues, month, 'tien_mat'),
    transfer: sumByMonth(revenues, month, 'chuyen_khoan'),
  }), [revenues, month]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatMoney(context.parsed.y)} đ` } },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#8b9992', font: { size: 10 } } },
      y: { beginAtZero: true, border: { display: false, dash: [3, 4] }, grid: { color: '#edf1ed' }, ticks: { color: '#8b9992', font: { size: 10 }, callback: (value) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value) } },
    },
  };

  const splitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${formatMoney(context.raw)} đ` } } },
  };

  const percentage = (value) => value === null ? 'Chưa có kỳ trước' : `${value >= 0 ? '↗' : '↘'} ${Math.abs(value).toFixed(1)}% so với tháng trước`;
  const dateLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <main className='overview-page'>
      <header className='overview-heading'>
        <div><p className='overview-eyebrow'>{dateLabel.toLocaleUpperCase('vi')}</p><h1>Tổng quan tài chính</h1></div>
        <div className='overview-actions'>
          <label className='overview-month-picker'><span>Tháng</span><input aria-label='Chọn tháng tổng quan' type='month' value={month} onChange={(event) => setMonth(event.target.value)} /></label>
          <Link className='overview-add-button' to='/expenses'><span aria-hidden='true'>＋</span> Thêm giao dịch</Link>
        </div>
      </header>

      {error && <p className='overview-error' role='alert'>{error}</p>}

      <section className='overview-kpis' aria-label='Kết quả trong tháng'>
        <article className='overview-kpi overview-kpi-primary'>
          <span className='overview-kpi-icon' aria-hidden='true'>▣</span><span>Lợi nhuận ròng</span>
          <strong>{loading ? '—' : `${formatMoney(totals.profit)} đ`}</strong>
          <small>{totals.profit >= 0 ? 'Thu nhập sau chi phí' : 'Chi phí đang cao hơn doanh thu'}</small>
        </article>
        <article className='overview-kpi'>
          <span className='overview-kpi-icon overview-kpi-green' aria-hidden='true'>↗</span><span>Tổng doanh thu</span>
          <strong>{loading ? '—' : `${formatMoney(totals.revenue)} đ`}</strong>
          <small>{percentage(totals.revenueTrend)}</small>
        </article>
        <article className='overview-kpi'>
          <span className='overview-kpi-icon overview-kpi-warm' aria-hidden='true'>▤</span><span>Tổng chi phí</span>
          <strong>{loading ? '—' : `${formatMoney(totals.expense)} đ`}</strong>
          <small>{percentage(totals.expenseTrend)}</small>
        </article>
      </section>

      <section className='overview-panels'>
        <article className='overview-panel overview-chart-panel'>
          <header className='overview-panel-heading'>
            <div><h2>Tổng quan doanh thu</h2><p>Doanh thu và chi phí theo tháng trong năm {selectedYear}</p></div>
            <div className='overview-legend'><span><i className='legend-revenue' />Doanh thu</span><span><i className='legend-expense' />Chi phí</span></div>
          </header>
          <div className='overview-bar-chart'><Bar data={yearlyChart} options={barOptions} /></div>
        </article>

        <article className='overview-panel overview-split-panel'>
          <header className='overview-panel-heading'><div><h2>Nguồn doanh thu</h2><p>Phân bổ thanh toán tháng {month.slice(5, 7)}/{month.slice(0, 4)}</p></div></header>
          <div className='overview-donut-wrap'>
            <Doughnut data={{ labels: ['Chuyển khoản', 'Tiền mặt'], datasets: [{ data: [revenueSplit.transfer, revenueSplit.cash], backgroundColor: ['#315f4e', '#e7b77f'], borderWidth: 0, hoverOffset: 3 }] }} options={splitOptions} />
            <div className='overview-donut-label'><strong>{totals.revenue ? `${Math.round((revenueSplit.transfer / totals.revenue) * 100)}%` : '0%'}</strong><span>Chuyển khoản</span></div>
          </div>
          <div className='overview-source-legend'>
            <div><span><i className='legend-revenue' />Chuyển khoản</span><strong>{formatMoney(revenueSplit.transfer)} đ</strong></div>
            <div><span><i className='legend-cash' />Tiền mặt</span><strong>{formatMoney(revenueSplit.cash)} đ</strong></div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;