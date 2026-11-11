import { useEffect, useState } from 'react';
import { API_URL } from '../../api';
import './Website.css';

const json = { 'Content-Type': 'application/json' };

const SECTIONS = [
  {
    title: 'Thương hiệu',
    fields: [
      ['name', 'Tên nhà hàng'],
      ['tagline', 'Slogan ngắn'],
      ['logo_url', 'Logo', 'image'],
    ],
  },
  {
    title: 'Trang chủ',
    fields: [
      ['hero_title', 'Tiêu đề chính'],
      ['hero_subtitle', 'Mô tả', 'textarea'],
      ['hero_image_url', 'Ảnh nhà hàng (banner)', 'image'],
      ['rating', 'Điểm đánh giá'],
      ['delivery_time', 'Thời gian giao hàng'],
      ['min_price', 'Giá từ (đ)', 'number'],
    ],
  },
  {
    title: 'Câu chuyện',
    fields: [
      ['story_title', 'Tiêu đề'],
      ['story_text', 'Nội dung', 'textarea'],
      ['years_experience', 'Số năm kinh nghiệm'],
      ['story_image_url', 'Ảnh câu chuyện', 'image'],
    ],
  },
  {
    title: 'Liên hệ',
    fields: [
      ['address', 'Địa chỉ'],
      ['opening_hours', 'Giờ mở cửa'],
      ['phone', 'Số điện thoại'],
      ['email', 'Email'],
      ['maps_url', 'Link Google Maps'],
      ['facebook_url', 'Facebook'],
      ['instagram_url', 'Instagram'],
      ['tiktok_url', 'TikTok'],
    ],
  },
  {
    title: 'Thanh toán chuyển khoản',
    fields: [
      ['bank_id', 'Mã ngân hàng (VD: VCB, MB, TCB)'],
      ['bank_account', 'Số tài khoản'],
      ['bank_owner', 'Chủ tài khoản'],
    ],
  },
];

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function Restaurant() {
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/restaurant`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setValues)
      .catch(() => setError('Không tải được thông tin nhà hàng.'));
  }, []);

  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const upload = async (key, file) => {
    if (!file) return;
    setUploading(key);
    setError('');
    try {
      const image = await resizeImage(file);
      const response = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ image }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || 'Tải ảnh lên thất bại.');
      }
      const { url } = await response.json();
      set(key, url);
    } catch (uploadError) {
      setError(uploadError.message || 'Không tải được ảnh.');
    } finally {
      setUploading('');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/restaurant`, {
        method: 'PUT',
        headers: json,
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error();
      setValues(await response.json());
      setMessage('Đã lưu thông tin nhà hàng.');
    } catch {
      setError('Không lưu được. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className='wsite'>
      <header className='wsite-page-head'>
        <div>
          <span className='wsite-eyebrow'>QUẢN LÝ WEBSITE</span>
          <h1>Thông tin nhà hàng</h1>
        </div>
        <button className='btn primary' type='submit' form='restaurant-form' disabled={saving || !values}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </header>
      {error && <p className='wsite-error' role='alert'>{error}</p>}
      {message && <p role='status'>{message}</p>}
      {values && (
        <form id='restaurant-form' onSubmit={submit} className='wsite-restaurant'>
          {SECTIONS.map((section) => (
            <section className='wsite-table-card wsite-restaurant-card' key={section.title}>
              <h2>{section.title}</h2>
              <div className='wsite-product-form'>
                {section.fields.map(([key, label, type]) => (
                  <label className={`wsite-field${type === 'textarea' || type === 'image' ? ' full' : ''}`} key={key}>
                    {label}
                    {type === 'textarea' ? (
                      <textarea rows={3} value={values[key] || ''} onChange={(e) => set(key, e.target.value)} />
                    ) : type === 'image' ? (
                      <>
                        <input
                          value={values[key] || ''}
                          onChange={(e) => set(key, e.target.value)}
                          placeholder='https://...'
                        />
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            upload(key, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                        {uploading === key && <small>Đang tải ảnh lên...</small>}
                        {values[key] && (
                          <div className='wsite-image-preview'>
                            <img src={values[key]} alt={label} />
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        type={type === 'number' ? 'number' : 'text'}
                        value={values[key] || ''}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))}
        </form>
      )}
    </main>
  );
}

export default Restaurant;
