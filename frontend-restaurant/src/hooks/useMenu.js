import { useEffect, useState } from "react";

const configuredApiUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
)
  .trim()
  .replace(/\/+$/, "");

export const API_URL = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

const icons = ["🍚", "🍜", "🥢", "🍱", "🥤"];

export default function useMenu() {
  const [menu, setMenu] = useState({
    categories: [{ id: "all", label: "Tất cả món", icon: "✦" }],
    products: [],
    loading: true,
    failed: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`${API_URL}/categories`, { signal: controller.signal }).then((r) =>
        r.json(),
      ),
      fetch(`${API_URL}/products`, { signal: controller.signal }).then((r) =>
        r.json(),
      ),
    ])
      .then(([cats, prods]) => {
        if (!Array.isArray(cats) || !Array.isArray(prods)) throw new Error("bad");
        const activeCategories = cats.filter((category) => category.is_active !== false);
        const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
        setMenu({
          loading: false,
          failed: false,
          categories: [
            { id: "all", label: "Tất cả món", icon: "✦" },
            ...activeCategories.map((c, i) => ({
              id: `c-${c.id}`,
              label: c.name,
              icon: icons[i % icons.length],
            })),
          ],
          products: prods
            .filter((p) => p.is_available !== false && activeCategoryIds.has(p.category_id))
            .map((p) => ({
              id: `p-${p.id}`,
              name: p.name,
              category: `c-${p.category_id}`,
              description: p.description,
              price: p.price,
              rating: Number(p.rating).toFixed(1),
              tag: p.is_best_seller ? "BÁN CHẠY" : "MÓN NGON",
              softTag: !p.is_best_seller,
              image: p.image,
              imageDescription: p.name,
            })),
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setMenu((current) => ({ ...current, loading: false, failed: true }));
      });
    return () => controller.abort();
  }, []);

  return menu;
}
