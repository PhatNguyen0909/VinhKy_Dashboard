const details = [
  {
    icon: "⌖",
    label: "ĐỊA CHỈ",
    content: (
      <>
        125 Nguyễn Tri Phương, P.7,
        <br />
        Q.5, TP. Hồ Chí Minh
      </>
    ),
  },
  {
    icon: "◷",
    label: "GIỜ MỞ CỬA",
    content: "10:00 – 21:30 · Thứ 2 đến Chủ nhật",
  },
  { icon: "☎", label: "ĐẶT MÓN", content: "090 123 4567" },
];

export default function VisitSection() {
  return (
    <section className="visit-section section-shell section-pad" id="visit">
      <div className="center-heading">
        <span className="eyebrow eyebrow--plain">GHÉ THĂM CHÚNG MÌNH</span>
        <h2>
          Ghé <em>Vĩnh Ký</em>
        </h2>
        <p>Không gian ấm cúng, món ngon đang chờ bạn!</p>
      </div>
      <div className="visit-card">
        <div className="visit-map" aria-label="Bản đồ vị trí Vĩnh Ký">
          <div className="map-lines" />
          <span className="map-pin">♥</span>
          <span className="map-label">VĨNH KÝ</span>
          <span className="map-road map-road--one" />
          <span className="map-road map-road--two" />
        </div>
        <div className="visit-details">
          {details.map((detail) => (
            <div className="visit-detail" key={detail.label}>
              <span className="visit-icon">{detail.icon}</span>
              <div>
                <small>{detail.label}</small>
                <strong>{detail.content}</strong>
              </div>
            </div>
          ))}
          <div className="visit-actions">
            <a
              className="button button--primary"
              href="https://maps.google.com/?q=125+Nguyen+Tri+Phuong+Ho+Chi+Minh"
              target="_blank"
              rel="noreferrer"
            >
              Chỉ đường ↗
            </a>
            <a className="button button--outline" href="tel:0901234567">
              Gọi cho quán
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
