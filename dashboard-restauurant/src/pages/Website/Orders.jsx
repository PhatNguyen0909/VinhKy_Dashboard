import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };
const money = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';
const STATUS = { new: 'Mới', preparing: 'Đang làm', done: 'Hoàn thành', cancelled: 'Đã hủy' };
const TABS = [
  ['todo', 'Cần làm'],
  ['unpaid', 'Chờ thanh toán'],
  ['done', 'Hoàn thành'],
  ['cancelled', 'Đã hủy'],
  ['all', 'Tất cả'],
];

const matches = (o, tab) => {
  if (tab === 'todo') return o.payment_status === 'paid' && ['new', 'preparing'].includes(o.status);
  if (tab === 'unpaid') return o.payment_status === 'unpaid' && ['new', 'preparing'].includes(o.status);
  if (tab === 'all') return true;
  return o.status === tab;
};

const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio unavailable */
  }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('todo');
  const [fresh, setFresh] = useState(new Set());
  const [toast, setToast] = useState('');
  const seen = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      const paidNew = data.filter((o) => o.payment_status === 'paid' && o.status === 'new');
      if (seen.current === null) {
        seen.current = new Set(paidNew.map((o) => o.id));
      } else {
        const added = paidNew.filter((o) => !seen.current.has(o.id));
        if (added.length) {
          added.forEach((o) => seen.current.add(o.id));
          setFresh((f) => new Set([...f, ...added.map((o) => o.id)]));
          setToast(`Có ${added.length} đơn mới đã chuyển khoản: ${added.map((o) => o.code).join(', ')}`);
          beep();
          setTimeout(() => setToast(''), 6000);
        }
      }
      setOrders(data);
      window.dispatchEvent(new Event('orders-updated'));
    } catch {
      /* keep previous list on network error */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  const patch = async (o, body) => {
    await fetch(`${API_URL}/orders/${o.id}`, { method: 'PATCH', headers: json, body: JSON.stringify(body) });
    load();
  };

  const list = orders.filter((o) => matches(o, tab));

  return (
    <main className='wsite'>
      {toast && <div className='toast'>🔔 {toast}</div>}
      <div className='wsite-head'>
        <h1>Đơn hàng</h1>
        <div className='tabs'>
          {TABS.map(([k, label]) => (
            <button key={k} className={`btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
              {label} ({orders.filter((o) => matches(o, k)).length})
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 && <p>Không có đơn hàng.</p>}
      <div className='wsite-grid'>
        {list.map((o) => (
          <div className={`order ${fresh.has(o.id) ? 'fresh' : ''}`} key={o.id}>
            <div className='order-top'>
              <strong>{o.code}</strong>
              <span>
                <span className={`pill ${o.payment_status}`}>
                  {o.payment_status === 'paid' ? 'Đã chuyển khoản' : o.payment_method === 'cod' ? 'Thu tiền mặt' : 'Chưa thanh toán'}
                </span>{' '}
                <span className={`pill ${o.status}`}>{STATUS[o.status]}</span>
              </span>
            </div>
            <small>{new Date(o.created_at + 'Z').toLocaleString('vi-VN')}</small>
            <div>
              {o.customer_name} · {o.phone}
              {o.address && <small>{o.address}</small>}
              {o.note && <small>Ghi chú: {o.note}</small>}
            </div>
            <ul>
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.quantity} × {i.name}
                </li>
              ))}
            </ul>
            <strong>Tổng: {money(o.total)}</strong>
            <div className='wsite-actions'>
              {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
                <button className='btn ok' onClick={() => patch(o, { payment_status: 'paid' })}>
                  Xác nhận đã thu tiền
                </button>
              )}
              {o.status === 'new' && (
                <button className='btn primary' onClick={() => patch(o, { status: 'preparing' })}>
                  Nhận làm
                </button>
              )}
              {o.status === 'preparing' && (
                <button className='btn ok' onClick={() => patch(o, { status: 'done' })}>
                  Hoàn thành
                </button>
              )}
              {['new', 'preparing'].includes(o.status) && (
                <button className='btn danger' onClick={() => patch(o, { status: 'cancelled' })}>
                  Hủy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Orders;
