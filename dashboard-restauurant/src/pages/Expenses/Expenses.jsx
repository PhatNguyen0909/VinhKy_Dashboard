import React, { useEffect, useMemo, useState } from 'react';
import { EXPENSE_FIELDS as FIELDS } from './expenseFields';
import { API_URL } from '../../api';
import './Expenses.css';

const number = (value) =>
  new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
const getApiError = (result, fallback) => {
  const detail = Array.isArray(result?.detail)
    ? result.detail
        .map(
          (issue) =>
            `${issue.loc?.slice(1).join('.') || 'request'}: ${issue.msg}`
        )
        .join('; ')
    : result?.detail;
  return typeof detail === 'string' || detail ? String(detail) : fallback;
};
const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const TODAY = getToday();
const totalOf = (item) =>
  FIELDS.reduce((sum, field) => sum + Number(item[field.key] || 0), 0);
const emptyValues = () =>
  Object.fromEntries(FIELDS.map(({ key }) => [key, '']));

function Expenses() {
  const today = TODAY;
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState(emptyValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleFinanceUpdate = () => setRefreshKey((key) => key + 1);
    window.addEventListener('finance-data-updated', handleFinanceUpdate);
    return () =>
      window.removeEventListener('finance-data-updated', handleFinanceUpdate);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/expense_items`)
      .then((response) => {
        if (!response.ok) throw new Error('Không thể tải danh sách chi phí.');
        return response.json();
      })
      .then((data) => {
        setItems(data || []);
        const latestMonth = (data || [])
          .map((item) => item.date || '')
          .sort()
          .at(-1)
          ?.slice(0, 7);
        if (latestMonth) setMonth(latestMonth);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [today, refreshKey]);

  const groups = useMemo(() => {
    const grouped = {};
    const term = search.trim().toLocaleLowerCase('vi');
    items.forEach((item) => {
      if (!item.date || item.date.slice(0, 7) !== month) return;
      const categories = FIELDS.filter(
        (field) => Number(item[field.key] || 0) > 0
      ).map((field) => ({ ...field, amount: Number(item[field.key]) }));
      const searchable =
        `${item.date} ${categories.map((field) => field.label).join(' ')}`.toLocaleLowerCase(
          'vi'
        );
      if (term && !searchable.includes(term)) return;
      if (!grouped[item.date])
        grouped[item.date] = { date: item.date, total: 0, items: [] };
      grouped[item.date].items.push({ ...item, categories });
      grouped[item.date].total += totalOf(item);
    });
    return Object.values(grouped)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => (a.id || 0) - (b.id || 0)),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [items, month, search]);

  const summary = useMemo(() => {
    const transactions = groups.flatMap((group) => group.items);
    const categories = new Set(
      transactions.flatMap((item) => item.categories.map(({ key }) => key))
    );
    return {
      total: groups.reduce((sum, group) => sum + group.total, 0),
      transactions: transactions.length,
      categories: categories.size,
    };
  }, [groups]);

  const startEditing = (item) => {
    setEditingItem(item);
    setDate(item.date);
    setValues(
      Object.fromEntries(FIELDS.map(({ key }) => [key, String(item[key] ?? 0)]))
    );
    setError('');
    setShowForm(false);
  };

  const toggleEntryForm = () => {
    setShowForm((open) => !open);
    setEditingItem(null);
    setDate(today);
    setValues(emptyValues());
    setError('');
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setDate(today);
    setValues(emptyValues());
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amounts = Object.fromEntries(
      FIELDS.map(({ key }) => [key, Number(values[key]) || 0])
    );
    if (!editingItem && !Object.values(amounts).some((amount) => amount > 0)) {
      setError('Nhập ít nhất một khoản chi trước khi lưu.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(
        editingItem
          ? `${API_URL}/expense_items/${editingItem.id}`
          : `${API_URL}/expense_items`,
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, ...amounts }),
        }
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          getApiError(result, 'Không thể lưu phiếu chi. Vui lòng thử lại.')
        );
      }
      const savedItem = result;
      setItems((current) =>
        editingItem
          ? current.map((item) => (item.id === savedItem.id ? savedItem : item))
          : [...current, savedItem]
      );
      setMonth(date.slice(0, 7));
      setSearch('');
      setDate(today);
      setValues(emptyValues());
      setEditingItem(null);
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) =>
    new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));

  return (
    <main className='expense-page'>
      <header className='expense-page-heading'>
        <div>
          <p className='expense-eyebrow'>SỔ CHI TIÊU</p>
          <h1>Chi phí</h1>
        </div>
        <button
          className='expense-add-button'
          type='button'
          onClick={toggleEntryForm}
        >
          <span aria-hidden='true'>{showForm ? '−' : '+'}</span>
          {showForm ? 'Đóng biểu mẫu' : 'Thêm chi phí'}
        </button>
      </header>

      <section className='expense-summary' aria-label='Tổng quan chi phí'>
        <article className='expense-stat'>
          <span>Tổng chi phí</span>
          <strong>{number(summary.total)} đ</strong>
          <small>
            Tháng {month.slice(5, 7)}/{month.slice(0, 4)}
          </small>
        </article>
        <article className='expense-stat'>
          <span>Phiếu chi</span>
          <strong>{summary.transactions}</strong>
          <small>Trong tháng đã chọn</small>
        </article>
        <article className='expense-stat'>
          <span>Hạng mục</span>
          <strong>{summary.categories}</strong>
          <small>Đang phát sinh</small>
        </article>
      </section>

      {showForm && (
        <section className='expense-entry-panel'>
          <div className='expense-panel-heading'>
            <div>
              <h2>Thêm phiếu chi</h2>
              <p>Nhập nhiều hạng mục trong cùng một lần lưu.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='expense-entry-grid'>
              <label className='expense-entry-field expense-entry-date'>
                <span>Ngày</span>
                <input
                  type='date'
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </label>
              {FIELDS.map((field) => (
                <label className='expense-entry-field' key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type='number'
                    min='0'
                    step='any'
                    inputMode='numeric'
                    placeholder='0'
                    value={values[field.key]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <div className='expense-entry-footer'>
              <span>
                Tổng phiếu:{' '}
                <strong>
                  {number(
                    FIELDS.reduce(
                      (sum, field) => sum + (Number(values[field.key]) || 0),
                      0
                    )
                  )}{' '}
                  đ
                </strong>
              </span>
              <button type='submit' disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu phiếu chi'}
              </button>
            </div>
          </form>
        </section>
      )}

      {error && (
        <p className='expense-error' role='alert'>
          {error}
        </p>
      )}

      <section className='expense-records'>
        <div className='expense-records-heading'>
          <div>
            <h2>Danh sách chi phí</h2>
            <p>Các phiếu được nhóm theo ngày phát sinh.</p>
          </div>
          <div className='expense-filters'>
            <label className='expense-search'>
              <span aria-hidden='true'>⌕</span>
              <input
                aria-label='Tìm hạng mục chi phí'
                placeholder='Tìm chi phí'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className='expense-month'>
              <span aria-hidden='true'>▦</span>
              <input
                aria-label='Chọn tháng'
                type='month'
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <p className='expense-empty'>Đang tải dữ liệu...</p>
        ) : groups.length === 0 ? (
          <p className='expense-empty'>Không có chi phí trong tháng này.</p>
        ) : (
          <div className='expense-day-list'>
            {groups.map((group) => (
              <section className='expense-day-group' key={group.date}>
                <header className='expense-day-heading'>
                  <div>
                    <h3>{formatDate(group.date)}</h3>
                    <span>{group.items.length} phiếu chi</span>
                  </div>
                  <strong>{number(group.total)} đ</strong>
                </header>
                <div className='expense-table-wrap'>
                  <table className='expense-record-table'>
                    <thead>
                      <tr>
                        <th>Phiếu chi</th>
                        <th>Chi tiết các khoản</th>
                        <th className='expense-amount-heading'>Số tiền</th>
                        <th aria-label='Thao tác'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, index) => (
                        <React.Fragment
                          key={item.id ?? `${group.date}-${index}`}
                        >
                          <tr>
                            <td>
                              <strong>
                                Phiếu chi {String(index + 1).padStart(2, '0')}
                              </strong>
                              <small>{item.categories.length} hạng mục</small>
                            </td>
                            <td>
                              <div className='expense-category-list'>
                                {item.categories.length ? (
                                  item.categories.map((category) => (
                                    <span
                                      className='expense-category-tag'
                                      key={category.key}
                                    >
                                      {category.label}
                                      <b>{number(category.amount)} đ</b>
                                    </span>
                                  ))
                                ) : (
                                  <span className='expense-category-tag'>
                                    Chưa có hạng mục
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className='expense-row-amount'>
                              {number(totalOf(item))} đ
                            </td>
                            <td className='expense-row-actions'>
                              <button
                                type='button'
                                className='expense-edit-button'
                                aria-label={`Chỉnh sửa phiếu chi ${item.id}`}
                                title='Chỉnh sửa'
                                onClick={() => startEditing(item)}
                              >
                                ✎
                              </button>
                            </td>
                          </tr>
                          {editingItem?.id === item.id && (
                            <tr className='expense-inline-editor-row'>
                              <td colSpan={4}>
                                <form
                                  className='expense-inline-editor'
                                  onSubmit={handleSubmit}
                                >
                                  <label className='expense-entry-field'>
                                    <span>Ngày</span>
                                    <input
                                      type='date'
                                      value={date}
                                      onChange={(event) =>
                                        setDate(event.target.value)
                                      }
                                      required
                                    />
                                  </label>
                                  {FIELDS.map((field) => (
                                    <label
                                      className='expense-entry-field'
                                      key={field.key}
                                    >
                                      <span>{field.label}</span>
                                      <input
                                        type='number'
                                        min='0'
                                        step='any'
                                        inputMode='numeric'
                                        value={values[field.key]}
                                        onChange={(event) =>
                                          setValues((current) => ({
                                            ...current,
                                            [field.key]: event.target.value,
                                          }))
                                        }
                                      />
                                    </label>
                                  ))}
                                  <div className='expense-inline-editor-footer'>
                                    <span>
                                      Tổng phiếu:{' '}
                                      <strong>
                                        {number(
                                          FIELDS.reduce(
                                            (sum, field) =>
                                              sum +
                                              (Number(values[field.key]) || 0),
                                            0
                                          )
                                        )}{' '}
                                        đ
                                      </strong>
                                    </span>
                                    <div>
                                      <button
                                        type='button'
                                        className='expense-inline-cancel'
                                        onClick={cancelEditing}
                                      >
                                        Hủy
                                      </button>
                                      <button type='submit' disabled={saving}>
                                        {saving
                                          ? 'Đang lưu...'
                                          : 'Lưu thay đổi'}
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Expenses;
