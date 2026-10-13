import { useCallback, useEffect, useMemo, useState } from "react";
import CartDrawer from "./components/CartDrawer.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import { combos, products as staticProducts } from "./data/menu.js";
import useMenu from "./hooks/useMenu.js";

const fixedItems = {
  ...Object.fromEntries(staticProducts.filter((p) => p.id === "combo").map((p) => [p.id, p])),
  "group-combo": { id: "group-combo", ...combos.group },
};

export default function App() {
  const menu = useMenu();
  const productLookup = useMemo(
    () => ({
      ...Object.fromEntries(menu.products.map((product) => [product.id, product])),
      ...fixedItems,
    }),
    [menu.products],
  );
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const cartCount = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = window.setTimeout(
      () => setToast((current) => ({ ...current, visible: false })),
      2300,
    );
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addToCart = useCallback((id) => {
    const product = productLookup[id];
    if (!product) {
      console.error(`Unknown menu item: ${id}`);
      return;
    }
    setCart((current) => ({
      ...current,
      [id]: {
        ...product,
        quantity: (current[id]?.quantity || 0) + 1,
      },
    }));
    setToast({ message: `Đã thêm ${product.name} vào giỏ`, visible: true });
  }, [productLookup]);

  const changeQuantity = useCallback((id, quantity) => {
    setCart((current) => {
      if (!current[id]) return current;
      if (quantity <= 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: { ...current[id], quantity } };
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <>
      <SiteHeader cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <HomePage onAdd={addToCart} menu={menu} />
      <CartDrawer
        cart={cart}
        cartCount={cartCount}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onQuantityChange={changeQuantity}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart({})}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
