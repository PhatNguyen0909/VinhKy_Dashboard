import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };
const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;
const STATUS = {
  new: 'Mới',
  preparing: 'Đang làm',
  done: 'Hoàn thành',
  cancelled: 'Đã hủy',
};
const TABS = [
  ['todo', 'Cần làm'],
  ['unpaid', 'Chờ thanh toán'],
  ['done', 'Hoàn thành'],
  ['cancelled', 'Đã hủy'],
  ['all', 'Tất cả'],
];

const matches = (order, tab) => {
  if (tab === 'todo') {
    return order.payment_status === 'paid' && ['new', 'preparing'].includes(order.status);
  }
  if (tab === 'unpaid') {
    return order.payment_status === 'unpaid' && ['new', 'preparing'].includes(order.status);
  }
  if (tab === 'all') return true;
  return order.status === tab;
};

const orderDate = (value) =>
  new Date(value.endsWith('Z') ? value : `${value}Z`);

const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio can be unavailable or blocked by the browser.
  }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('todo');
  const [search, setSearch] = useState('');
  const [fresh, setFresh] = useState(new Set());
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const seen = useRef(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) throw new Error('Không thể tải đơn hàng.');
      const data = await response.json();
      const paidNew = data.filter(
        (order) => order.payment_status === 'paid' && order.status === 'new'
      );
      if (seen.current === null) {
        seen.current = new Set(paidNew.map((order) => order.id));
      } else {
        const added = paidNew.filter((order) => !seen.current.has(order.id));
        if (added.length) {
          added.forEach((order) => seen.current.add(order.id));
          setFresh((current) => new Set([...current, ...added.map((order) => order.id)]));
          setToast(
            `Có ${added.length} đơn mới đã chuyển khoản: ${added.map((order) => order.code).join(', ')}`
          );
          beep();
          window.setTimeout(() => setToast(''), 6000);
        }
      }
      setOrders(data);
      setError('');
      window.dispatchEvent(new Event('orders-updated'));
    } catch {
      setError('Không tải được đơn hàng. Vui lòng kiểm tra kết nối và thử lại.');
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 8000);
    return () => window.clearInterval(id);
  }, [load]);

  const patch = async (order, body) => {
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: 'PATCH',
        headers: json,
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Không thể cập nhật đơn hàng.');
      await load();
    } catch {
      setError('Cập nhật đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [order.code, order.customer_name, order.phone]
          .some((value) => (value || '').toLocaleLowerCase('vi').includes(query));
      return matches(order, tab) && matchesSearch;
    });
  }, [orders, search, tab]);

  const openOrders = orders.filter((order) => ['new', 'preparing'].includes(order.status));
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayValue = orders
    .filter((order) => orderDate(order.created_at) >= startOfToday)
    .reduce((total, order) => total + Number(order.total || 0), 0);

  return (
    <main className='wsite'>
      {toast && <div className='toast' role='status'>🔔 {toast}</div>}
      <header className='wsite-page-head'>
        <div>
          <span className='wsite-eyebrow'>QUẢN LÝ BÁN HÀNG</span>
          <h1>Đơn hàng</h1>
        </div>
        <span className='wsite-sync-status'><i /> Đồng bộ website đang bật</span>
      </header>

      <section className='wsite-stats' aria-label='Tổng quan đơn hàng'>
        <article className='wsite-stat'>
          <span>Tổng đơn hàng</span>
          <strong>{orders.length}</strong>
          <small>Trong hệ thống</small>
        </article>
        <article className='wsite-stat'>
          <span>Đơn đang xử lý</span>
          <strong>{openOrders.length}</strong>
          <small>Đang chờ hoàn tất</small>
        </article>
        <article className='wsite-stat'>
          <span>Giá trị hôm nay</span>
          <strong>{money(todayValue)}</strong>
          <small>Tính theo ngày hiện tại</small>
        </article>
      </section>

      <section className='wsite-table-card'>
        <div className='wsite-table-head orders-table-head'>
          <div>
            <h2>Danh sách đơn hàng</h2>
            <p>Đơn hàng được cập nhật tự động từ website</p>
          </div>
          <label className='wsite-search'>
            <span aria-hidden='true'>⌕</span>
            <input
              aria-label='Tìm đơn hàng'
              placeholder='Tìm theo mã, tên hoặc số điện thoại'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className='orders-toolbar'>
          <div className='tabs' role='tablist' aria-label='Lọc đơn hàng'>
            {TABS.map(([key, label]) => (
              <button
                key={key}
                role='tab'
                aria-selected={tab === key}
                className={`btn ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label} ({orders.filter((order) => matches(order, key)).length})
              </button>
            ))}
          </div>
          {error && <p className='wsite-error' role='alert'>{error}</p>}
        </div>
        <div className='wsite-table-scroll'>
          <table className='wsite-table orders-table'>
            <thead>
              <tr>
                <th>ĐƠN HÀNG</th>
                <th>CHI TIẾT</th>
                <th>TRẠNG THÁI</th>
                <th>TỔNG TIỀN</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr className={fresh.has(order.id) ? 'is-fresh' : ''} key={order.id}>
                  <td>
                    <strong>{order.customer_name}</strong>
                    <small>#{order.code}</small>
                    <small>{order.phone}</small>
                  </td>
                  <td>
                    <span>{order.address ? 'Giao tận nơi' : 'Đến lấy'} · {order.items.length} món</span>
                    <small title={order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}>
                      {order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}
                    </small>
                    <small>{orderDate(order.created_at).toLocaleString('vi-VN')}</small>
                  </td>
                  <td>
                    <span className={`pill ${order.status}`}>{STATUS[order.status] || order.status}</span>
                    <small>
                      <span className={`pill ${order.payment_status}`}>
                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </small>
                  </td>
                  <td><strong className='order-total'>{money(order.total)}</strong></td>
                  <td>
                    <div className='order-row-actions'>
                      {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                        <button className='btn ok' onClick={() => patch(order, { payment_status: 'paid' })}>
                          Xác nhận thu tiền
                        </button>
                      )}
                      {order.status !== 'done' && order.status !== 'cancelled' && (
                        <select
                          aria-label={`Cập nhật trạng thái đơn ${order.code}`}
                          value={order.status}
                          onChange={(event) => patch(order, { status: event.target.value })}
                        >
                          <option value='new'>Mới</option>
                          <option value='preparing'>Đang làm</option>
                          <option value='done'>Hoàn thành</option>
                          <option value='cancelled'>Đã hủy</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleOrders.length === 0 && (
                <tr>
                  <td className='wsite-empty' colSpan='5'>
                    {orders.length ? 'Không có đơn hàng phù hợp.' : 'Chưa có đơn hàng.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className='wsite-table-footer'>
          Hiển thị {visibleOrders.length} / {orders.length} đơn hàng
          <span>Thực đơn nhà hàng · Đang hoạt động</span>
        </footer>
      </section>
    </main>
  );
}

export default Orders;
