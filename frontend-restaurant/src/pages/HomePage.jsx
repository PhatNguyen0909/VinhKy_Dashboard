import ComboSection from "../components/ComboSection.jsx";
import HeroSection from "../components/HeroSection.jsx";
import MenuSection from "../components/MenuSection.jsx";
import ReasonsSection from "../components/ReasonsSection.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import StorySection from "../components/StorySection.jsx";
import VisitSection from "../components/VisitSection.jsx";

export default function HomePage({ onAdd, menu }) {
  return (
    <>
      <main>
        <HeroSection />
        <MenuSection onAdd={onAdd} menu={menu} />
        <ComboSection onAdd={onAdd} />
        <ReasonsSection />
        <StorySection />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
