import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../../api';
import { EXPENSE_FIELDS } from '../../pages/Expenses/expenseFields';
import './FinanceAssistant.css';

const REVENUE_FIELDS = [
  { key: 'tien_mat', label: 'Tiền mặt' },
  { key: 'chuyen_khoan', label: 'Chuyển khoản' },
];

const localToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN').format(value || 0);
const formatDate = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
const makeId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const errorMessage = (payload, fallback) => {
  if (typeof payload?.detail === 'string') return payload.detail;
  if (payload?.detail?.message) return payload.detail.message;
  return fallback;
};

function FinanceAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Mình là trợ lý tài chính. Bạn có thể hỏi hoặc mô tả khoản thu, chi theo cách tự nhiên. Mình sẽ hỏi lại nếu thiếu thông tin; dữ liệu chỉ được lưu khi bạn xác nhận bản nháp.',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const logRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (open && logRef.current)
      logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [open, messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const outgoingMessage = { id: makeId(), role: 'user', content };
    const transcript = [
      ...messages.map((message) => ({
        role: message.role,
        content: message.draft
          ? `${message.content}\nBản nháp đang xem: ${JSON.stringify(message.draft)}`
          : message.content,
      })),
      { role: 'user', content },
    ].slice(-20);

    setMessages((current) => [
      ...current.map((message) =>
        message.draft && !message.saved
          ? { ...message, superseded: true }
          : message
      ),
      outgoingMessage,
    ]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: transcript, today: localToday() }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          errorMessage(result, 'Trợ lý chưa thể trả lời lúc này.')
        );
      }
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          content: result.reply,
          draft: result.draft || null,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          content: error.message || 'Kết nối trợ lý thất bại.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const confirmDraft = async (message) => {
    if (!message.draft || message.superseded || message.saved || savingId)
      return;
    setSavingId(message.id);
    try {
      const response = await fetch(`${API_URL}/assistant/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed: true,
          kind: message.draft.kind,
          date: message.draft.date,
          values: message.draft.values,
          replace_existing: Boolean(message.draft.existing),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(errorMessage(result, 'Không thể lưu dữ liệu.'));

      setMessages((current) => [
        ...current.map((item) =>
          item.id === message.id ? { ...item, saved: true } : item
        ),
        {
          id: makeId(),
          role: 'assistant',
          content:
            result.kind === 'expense'
              ? `Đã lưu phiếu chi ngày ${formatDate(result.date)}, tổng ${formatMoney(result.total)} đ.`
              : `${result.replaced ? 'Đã thay thế' : 'Đã lưu'} doanh thu ngày ${formatDate(result.date)}, tổng ${formatMoney(result.total)} đ.`,
        },
      ]);
      window.dispatchEvent(new Event('finance-data-updated'));
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          content: error.message || 'Không thể lưu dữ liệu.',
        },
      ]);
    } finally {
      setSavingId(null);
    }
  };

  const discardDraft = (messageId) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, superseded: true } : message
      )
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className='finance-assistant'>
      {open && (
        <section
          className='finance-assistant-panel'
          role='dialog'
          aria-label='Trợ lý tài chính'
        >
          <header className='finance-assistant-header'>
            <span className='finance-assistant-avatar' aria-hidden='true'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='4' y='7' width='16' height='13' rx='4' />
                <path d='M9 12h.01M15 12h.01M9 16h6M12 7V4m-2 0h4' />
              </svg>
            </span>
            <div>
              <strong>Trợ lý tài chính</strong>
              <small>AI hỗ trợ thu và chi</small>
            </div>
            <button
              className='finance-assistant-close'
              type='button'
              aria-label='Đóng trợ lý'
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div
            className='finance-assistant-messages'
            ref={logRef}
            role='log'
            aria-live='polite'
          >
            {messages.map((message) => {
              const fields =
                message.draft?.kind === 'expense'
                  ? EXPENSE_FIELDS
                  : REVENUE_FIELDS;
              const entries = message.draft
                ? fields.filter(
                    (field) => Number(message.draft.values[field.key]) > 0
                  )
                : [];
              const draftTotal = entries.reduce(
                (sum, field) =>
                  sum + Number(message.draft.values[field.key] || 0),
                0
              );

              return (
                <article
                  className={`finance-assistant-message ${message.role}`}
                  key={message.id}
                >
                  <p>{message.content}</p>
                  {message.draft && (
                    <div className='finance-assistant-draft'>
                      <div className='finance-assistant-draft-title'>
                        <span>
                          {message.draft.kind === 'expense'
                            ? 'Bản nháp chi phí'
                            : 'Bản nháp doanh thu'}
                        </span>
                        <strong>{formatDate(message.draft.date)}</strong>
                      </div>
                      <div className='finance-assistant-draft-lines'>
                        {entries.map((field) => (
                          <div key={field.key}>
                            <span>{field.label}</span>
                            <strong>
                              {formatMoney(message.draft.values[field.key])} đ
                            </strong>
                          </div>
                        ))}
                      </div>
                      <div className='finance-assistant-draft-total'>
                        <span>Tổng</span>
                        <strong>{formatMoney(draftTotal)} đ</strong>
                      </div>
                      {message.draft.existing && (
                        <div className='finance-assistant-existing'>
                          Đã có doanh thu ngày này: tiền mặt{' '}
                          {formatMoney(message.draft.existing.tien_mat)} đ,
                          chuyển khoản{' '}
                          {formatMoney(message.draft.existing.chuyen_khoan)} đ.
                          Xác nhận sẽ thay thế số cũ.
                        </div>
                      )}
                      {message.saved ? (
                        <div className='finance-assistant-draft-status'>
                          Đã lưu
                        </div>
                      ) : message.superseded ? (
                        <div className='finance-assistant-draft-status'>
                          Bản nháp cũ, không còn hiệu lực
                        </div>
                      ) : (
                        <div className='finance-assistant-draft-actions'>
                          <button
                            className='finance-assistant-discard'
                            type='button'
                            onClick={() => discardDraft(message.id)}
                          >
                            Bỏ bản nháp
                          </button>
                          <button
                            type='button'
                            disabled={Boolean(savingId)}
                            onClick={() => confirmDraft(message)}
                          >
                            {savingId === message.id
                              ? 'Đang lưu...'
                              : message.draft.existing
                                ? 'Xác nhận thay thế'
                                : 'Xác nhận lưu'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
            {sending && (
              <div className='finance-assistant-thinking' role='status'>
                Đang suy nghĩ…
              </div>
            )}
          </div>

          <form
            className='finance-assistant-composer'
            ref={formRef}
            onSubmit={sendMessage}
          >
            <label
              className='finance-assistant-sr-only'
              htmlFor='finance-assistant-input'
            >
              Tin nhắn cho trợ lý
            </label>
            <textarea
              id='finance-assistant-input'
              rows='2'
              maxLength='3000'
              placeholder='Hỏi hoặc mô tả khoản thu, chi…'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type='submit'
              aria-label='Gửi tin nhắn'
              disabled={!input.trim() || sending}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d='m22 2-7 20-4-9-9-4Z' />
                <path d='M22 2 11 13' />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button
        className='finance-assistant-toggle'
        type='button'
        aria-label={open ? 'Đóng trợ lý tài chính' : 'Mở trợ lý tài chính'}
        aria-expanded={open}
        title='Trợ lý tài chính'
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <span aria-hidden='true'>×</span>
        ) : (
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z' />
            <path d='M8 11h.01M12 11h.01M16 11h.01' />
          </svg>
        )}
      </button>
    </div>
  );
}

export default FinanceAssistant;
