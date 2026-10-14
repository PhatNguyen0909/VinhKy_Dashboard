import { useRestaurant } from "../context/RestaurantContext.jsx";

export default function StorySection() {
  const r = useRestaurant();
  return (
    <section className="story-section section-shell section-pad" id="story">
      <div className="story-photo">
        <img src={r.storyImage} alt={r.name} loading="lazy" />
        <span className="story-years">
          <strong>{r.years_experience}</strong>
          <small>
            NĂM GIỮ
            <br />
            VỊ NGON
          </small>
        </span>
      </div>
      <div className="story-copy">
        <span className="eyebrow eyebrow--plain">
          {(r.story_title || "").toUpperCase()}
        </span>
        <h2>
          {r.name} — <em>{r.tagline}</em>
        </h2>
        <p>{r.story_text}</p>
        <a className="text-link" href="#visit">
          Ghé thăm chúng mình <span>→</span>
        </a>
      </div>
    </section>
  );
}
