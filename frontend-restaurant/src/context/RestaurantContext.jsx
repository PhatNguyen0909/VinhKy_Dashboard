import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../hooks/useMenu.js";
import logoLocal from "../image/logo.png";
import restaurantLocal from "../image/restaurant.png";

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/restaurant`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setInfo(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (info?.name) document.title = `${info.name} — ${info.tagline || ""}`;
  }, [info]);

  const value = {
    loaded: Boolean(info),
    ...(info || {}),
    logo: info?.logo_url || logoLocal,
    heroImage: info?.hero_image_url || restaurantLocal,
    storyImage: info?.story_image_url || restaurantLocal,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}
