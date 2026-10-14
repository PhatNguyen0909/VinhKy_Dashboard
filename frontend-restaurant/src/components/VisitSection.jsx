import { useRestaurant } from "../context/RestaurantContext.jsx";

export default function VisitSection() {
  const r = useRestaurant();
  const phoneHref = `tel:${(r.phone || "").replace(/\s/g, "")}`;
  const mapsHref =
    r.maps_url ||
    `https://maps.google.com/?q=${encodeURIComponent(r.address || "")}`;
  const details = [
    { icon: "⌖", label: "ĐỊA CHỈ", content: r.address },
    { icon: "◷", label: "GIỜ MỞ CỬA", content: r.opening_hours },
    { icon: "☎", label: "ĐẶT MÓN", content: r.phone },
  ];

  return (
    <section className="visit-section section-shell section-pad" id="visit">
      <div className="center-heading">
        <span className="eyebrow eyebrow--plain">GHÉ THĂM CHÚNG MÌNH</span>
        <h2>
          Ghé <em>{r.name}</em>
        </h2>
        <p>Không gian ấm cúng, món ngon đang chờ bạn!</p>
      </div>
      <div className="visit-card">
        <div className="visit-map" aria-label={`Bản đồ vị trí ${r.name}`}>
          <div className="map-lines" />
          <span className="map-pin">♥</span>
          <span className="map-label">{(r.name || "").toUpperCase()}</span>
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
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
            >
              Chỉ đường ↗
            </a>
            <a className="button button--outline" href={phoneHref}>
              Gọi cho quán
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
