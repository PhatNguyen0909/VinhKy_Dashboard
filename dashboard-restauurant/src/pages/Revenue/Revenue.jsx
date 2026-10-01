import { useEffect, useMemo, useState } from 'react';
import './Revenue.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const todayValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};
const money = (value) =>
  new Intl.NumberFormat('vi-VN').format(Number(value) || 0);

function Revenue() {
  const today = todayValue();
  const [revenues, setRevenues] = useState([]);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [date, setDate] = useState(today);
  const [cash, setCash] = useState('');
  const [transfer, setTransfer] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('daily');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/revenues`)
      .then((response) => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu doanh thu.');
        return response.json();
      })
      .then((data) => {
        const rows = data || [];
        setRevenues(rows);
        const latestMonth = rows
          .map((row) => row.date || '')
          .sort()
          .at(-1)
          ?.slice(0, 7);
        if (latestMonth) setMonth(latestMonth);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const existing = revenues.find((record) => record.date === date);
    setCash(existing ? String(existing.tien_mat ?? 0) : '');
    setTransfer(existing ? String(existing.chuyen_khoan ?? 0) : '');
  }, [date, revenues]);

  const monthRevenues = useMemo(
    () =>
      revenues.filter((record) => (record.date || '').slice(0, 7) === month),
    [revenues, month]
  );
  const summary = useMemo(
    () =>
      monthRevenues.reduce(
        (totals, record) => ({
          cash: totals.cash + Number(record.tien_mat || 0),
          transfer: totals.transfer + Number(record.chuyen_khoan || 0),
          total: totals.total + Number(record.total || 0),
        }),
        { cash: 0, transfer: 0, total: 0 }
      ),
    [monthRevenues]
  );

  const dailyRows = useMemo(
    () =>
      monthRevenues
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .flatMap((record) =>
          [
            {
              id: `${record.id}-cash`,
              source: 'Doanh thu bán hàng',
              method: 'Tiền mặt',
              amount: Number(record.tien_mat || 0),
              date: record.date,
            },
            {
              id: `${record.id}-transfer`,
              source: 'Doanh thu bán hàng',
              method: 'Chuyển khoản',
              amount: Number(record.chuyen_khoan || 0),
              date: record.date,
            },
          ].filter(
            (row) =>
              row.amount > 0 &&
              `${row.source} ${row.method} ${row.date}`
                .toLocaleLowerCase('vi')
                .includes(search.trim().toLocaleLowerCase('vi'))
          )
        ),
    [monthRevenues, search]
  );

  const formatDate = (value) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      date,
      tien_mat: Number(cash) || 0,
      chuyen_khoan: Number(transfer) || 0,
    };

    try {
      let response = await fetch(`${API_URL}/revenues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let updatedExisting = false;
      if (response.status === 400) {
        const listResponse = await fetch(`${API_URL}/revenues`);
        if (!listResponse.ok)
          throw new Error('Không thể kiểm tra doanh thu theo ngày.');
        const existingRows = await listResponse.json();
        const existing = existingRows.find((record) => record.date === date);
        if (existing) {
          response = await fetch(`${API_URL}/revenues/${existing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          updatedExisting = true;
        }
      }
      if (!response.ok)
        throw new Error('Không thể lưu doanh thu. Vui lòng thử lại.');
      const saved = await response.json();
      setRevenues((current) => [
        ...current.filter((record) => record.id !== saved.id),
        saved,
      ]);
      setMonth(date.slice(0, 7));
      setCash('');
      setTransfer('');
      setShowForm(false);
      setNotice(
        updatedExisting
          ? 'Đã cập nhật doanh thu trong ngày.'
          : 'Đã lưu doanh thu.'
      );
    } catch (saveError) {
      setError(saveError.message || 'Đã xảy ra lỗi khi lưu doanh thu.');
    } finally {
      setSaving(false);
    }
  };

  const monthlyRow = {
    date: month,
    cash: summary.cash,
    transfer: summary.transfer,
    total: summary.total,
  };

  return (
    <main className='revenue-page'>
      <header className='revenue-page-heading'>
        <div>
          <p className='revenue-eyebrow'>DOANH THU BÁN HÀNG</p>
          <h1>Doanh thu</h1>
        </div>
        <button
          className='revenue-add-button'
          type='button'
          onClick={() => setShowForm((open) => !open)}
        >
          <span aria-hidden='true'>{showForm ? '−' : '+'}</span>
          {showForm ? 'Đóng biểu mẫu' : 'Thêm doanh thu'}
        </button>
      </header>

      <section className='revenue-summary' aria-label='Tổng quan doanh thu'>
        <article className='revenue-stat'>
          <span>Doanh thu tiền mặt</span>
          <strong>{loading ? '—' : `${money(summary.cash)} đ`}</strong>
          <small>{monthRevenues.length} ngày ghi nhận</small>
        </article>
        <article className='revenue-stat'>
          <span>Doanh thu chuyển khoản</span>
          <strong>{loading ? '—' : `${money(summary.transfer)} đ`}</strong>
          <small>
            {month.slice(5, 7)}/{month.slice(0, 4)}
          </small>
        </article>
        <article className='revenue-stat revenue-stat-primary'>
          <span>Tổng doanh thu</span>
          <strong>{loading ? '—' : `${money(summary.total)} đ`}</strong>
          <small>Trong tháng đã chọn</small>
        </article>
      </section>

      {showForm && (
        <section className='revenue-entry-panel'>
          <header>
            <div>
              <h2>Ghi nhận doanh thu</h2>
              <p>Tiền mặt và chuyển khoản cho một ngày.</p>
            </div>
          </header>
          <form className='revenue-entry-form' onSubmit={handleSubmit}>
            <label>
              <span>Ngày</span>
              <input
                type='date'
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Tiền mặt</span>
              <input
                type='number'
                min='0'
                step='any'
                placeholder='0'
                value={cash}
                onChange={(event) => setCash(event.target.value)}
              />
            </label>
            <label>
              <span>Chuyển khoản</span>
              <input
                type='number'
                min='0'
                step='any'
                placeholder='0'
                value={transfer}
                onChange={(event) => setTransfer(event.target.value)}
              />
            </label>
            <div className='revenue-entry-total'>
              <span>Tổng phiếu</span>
              <strong>
                {money((Number(cash) || 0) + (Number(transfer) || 0))} đ
              </strong>
            </div>
            <button type='submit' disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu doanh thu'}
            </button>
          </form>
        </section>
      )}

      {error && (
        <p className='revenue-message revenue-message-error' role='alert'>
          {error}
        </p>
      )}
      {notice && (
        <p className='revenue-message' role='status'>
          {notice}
        </p>
      )}

      <section className='revenue-records'>
        <header className='revenue-records-heading'>
          <div>
            <h2>Doanh thu theo ngày</h2>
            <p>Theo dõi nguồn thu của nhà hàng</p>
          </div>
          <div className='revenue-record-tools'>
            <div
              className='revenue-view-switch'
              role='group'
              aria-label='Kiểu hiển thị'
            >
              <button
                className={view === 'daily' ? 'selected' : ''}
                type='button'
                onClick={() => setView('daily')}
              >
                Ngày
              </button>
              <button
                className={view === 'monthly' ? 'selected' : ''}
                type='button'
                onClick={() => setView('monthly')}
              >
                Tháng
              </button>
            </div>
            <label className='revenue-month-picker'>
              <span aria-hidden='true'>▦</span>
              <input
                aria-label='Chọn tháng doanh thu'
                type='month'
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>
          </div>
        </header>

        {view === 'daily' && (
          <label className='revenue-search'>
            <span aria-hidden='true'>⌕</span>
            <input
              aria-label='Tìm doanh thu'
              placeholder='Tìm doanh thu'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        )}

        <div className='revenue-table-wrap'>
          <table className='revenue-table'>
            <thead>
              <tr>
                <th>{view === 'daily' ? 'Nguồn doanh thu' : 'Kỳ'}</th>
                <th>{view === 'daily' ? 'Phương thức' : 'Tiền mặt'}</th>
                <th>{view === 'daily' ? 'Ngày' : 'Chuyển khoản'}</th>
                <th className='revenue-amount-heading'>
                  {view === 'daily' ? 'Số tiền' : 'Tổng'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className='revenue-empty'>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : view === 'daily' ? (
                dailyRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='revenue-empty'>
                      Không có doanh thu trong tháng này.
                    </td>
                  </tr>
                ) : (
                  dailyRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.source}</strong>
                        <small>
                          {row.method === 'Tiền mặt' ? 'DT-TM' : 'DT-CK'}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`revenue-method ${row.method === 'Tiền mặt' ? 'cash' : 'transfer'}`}
                        >
                          {row.method}
                        </span>
                      </td>
                      <td>{formatDate(row.date)}</td>
                      <td className='revenue-row-amount'>
                        +{money(row.amount)} đ
                      </td>
                    </tr>
                  ))
                )
              ) : monthRevenues.length === 0 ? (
                <tr>
                  <td colSpan={4} className='revenue-empty'>
                    Không có doanh thu trong tháng này.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>
                    <strong>
                      Tháng {month.slice(5, 7)}/{month.slice(0, 4)}
                    </strong>
                    <small>{monthRevenues.length} ngày ghi nhận</small>
                  </td>
                  <td>{money(monthlyRow.cash)} đ</td>
                  <td>{money(monthlyRow.transfer)} đ</td>
                  <td className='revenue-row-amount'>
                    {money(monthlyRow.total)} đ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Revenue;
