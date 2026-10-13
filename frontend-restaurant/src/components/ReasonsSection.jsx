const reasons = [
  ["♧", "Nguyên liệu tươi mỗi ngày", "Tuyển chọn kỹ càng từ nguồn cung uy tín."],
  ["♨", "Chế biến khi khách đặt", "Món luôn nóng hổi khi đến tay bạn."],
  ["♡", "Phần ăn đầy đặn", "No bụng, đủ chất với mức giá dễ chịu."],
  ["⌁", "Giao hàng nhanh chóng", "Đóng gói kỹ, giao nhanh trong 30 phút."],
];

export default function ReasonsSection() {
  return (
    <section className="reasons-section section-shell section-pad">
      <div className="center-heading">
        <span className="eyebrow eyebrow--plain">TRỌN VẸN TỪ TÂM</span>
        <h2>
          Vì sao chọn <em>Vĩnh Ký?</em>
        </h2>
        <p>Chúng mình chăm chút từng phần ăn như nấu cho người nhà.</p>
      </div>
      <div className="reason-grid">
        {reasons.map(([icon, title, description]) => (
          <article className="reason-card" key={title}>
            <span className="reason-icon">{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
