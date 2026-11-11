import { useRestaurant } from "../context/RestaurantContext.jsx";

const reasons = [
  ["♧", "Nguyên liệu tươi mỗi ngày", "Tuyển chọn kỹ càng từ nguồn cung uy tín."],
  ["♨", "Chế biến khi khách đặt", "Món luôn nóng hổi khi đến tay bạn."],
  ["♡", "Phần ăn đầy đặn", "No bụng, đủ chất với mức giá dễ chịu."],
];

export default function ReasonsSection() {
  const { name, delivery_time: deliveryTime } = useRestaurant();
  const items = [
    ...reasons,
    ["⌁", "Giao hàng nhanh chóng", `Đóng gói kỹ, giao nhanh trong ${deliveryTime}.`],
  ];
  return (
    <section className="reasons-section section-shell section-pad">
      <div className="center-heading">
        <span className="eyebrow eyebrow--plain">TRỌN VẸN TỪ TÂM</span>
        <h2>
          Vì sao chọn <em>{name}?</em>
        </h2>
        <p>Chúng mình chăm chút từng phần ăn như nấu cho người nhà.</p>
      </div>
      <div className="reason-grid">
        {items.map(([icon, title, description]) => (
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
