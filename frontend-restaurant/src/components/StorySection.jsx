export default function StorySection() {
  return (
    <section className="story-section section-shell section-pad" id="story">
      <div className="story-photo">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85"
          alt="Không gian ấm cúng của một quán ăn gia đình"
          loading="lazy"
        />
        <span className="story-years">
          <strong>10+</strong>
          <small>
            NĂM GIỮ
            <br />
            VỊ NGON
          </small>
        </span>
        <span className="story-caption">
          Một góc nhỏ thân quen
          <br />
          giữa lòng Sài Gòn
        </span>
      </div>
      <div className="story-copy">
        <span className="eyebrow eyebrow--plain">CÂU CHUYỆN VĨNH KÝ</span>
        <h2>
          Vĩnh Ký — ngon từ
          <br />
          <em>những món quen.</em>
        </h2>
        <p>
          Vĩnh Ký bắt đầu từ mong muốn mang những món ăn thân thuộc, nóng hổi
          và tử tế đến mỗi gia đình. Từ hạt gạo thơm, miếng gà mềm đến chảo mì
          xào giòn, tất cả đều được chuẩn bị mới mỗi ngày.
        </p>
        <blockquote>
          “Nấu món quen bằng cả tấm lòng, để mỗi bữa ăn đều là một niềm vui.”
        </blockquote>
        <a className="text-link" href="#visit">
          Ghé thăm chúng mình <span>→</span>
        </a>
      </div>
    </section>
  );
}
