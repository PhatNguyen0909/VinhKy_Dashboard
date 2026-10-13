import { useEffect, useState } from "react";
import {
  categories as staticCategories,
  products as staticProducts,
} from "../data/menu.js";

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const icons = ["🍚", "🍜", "🥢", "🍱", "🥤"];

export default function useMenu() {
  const [menu, setMenu] = useState({
    categories: staticCategories,
    products: staticProducts,
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
        if (!Array.isArray(cats) || !Array.isArray(prods) || !cats.length) return;
        setMenu({
          categories: [
            { id: "all", label: "Tất cả món", icon: "✦" },
            ...cats.map((c, i) => ({
              id: `c-${c.id}`,
              label: c.name,
              icon: icons[i % icons.length],
            })),
          ],
          products: prods.map((p) => ({
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
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return menu;
}
