import { useCallback, useEffect, useMemo, useState } from "react";
import AuthModal from "./components/AuthModal.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductOptionsModal from "./components/ProductOptionsModal.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import useMenu from "./hooks/useMenu.js";

export default function App() {
  const menu = useMenu();
  const productLookup = useMemo(
    () => Object.fromEntries(menu.products.map((product) => [product.id, product])),
    [menu.products],
  );
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [optionsProduct, setOptionsProduct] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
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
    setOptionsProduct(product);
  }, [productLookup]);

  const confirmAddToCart = useCallback(({ note, quantity, addOns }) => {
    const additions = [
      {
        key: `main:${optionsProduct.id}:${encodeURIComponent(note)}`,
        product: optionsProduct,
        quantity,
        note,
      },
      ...addOns.map((product) => ({
        key: `addon:${product.id}`,
        product,
        quantity,
        note: "",
      })),
    ];
    setCart((current) => {
      const next = { ...current };
      additions.forEach(({ key, product, quantity: addedQuantity, note: itemNote }) => {
        next[key] = {
          ...product,
          quantity: (next[key]?.quantity || 0) + addedQuantity,
          note: itemNote || next[key]?.note || "",
        };
      });
      return next;
    });
    setOptionsProduct(null);
    setToast({
      message: `Đã thêm ${optionsProduct.name} vào giỏ`,
      visible: true,
    });
  }, [optionsProduct]);

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
      <SiteHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onAuthOpen={() => setAuthOpen(true)}
      />
      <HomePage onAdd={addToCart} menu={menu} />
      {optionsProduct && (
        <ProductOptionsModal
          product={optionsProduct}
          addOns={menu.products.filter((product) =>
            ["món thêm", "nước uống"].includes(
              menu.categories
                .find((category) => category.id === product.category)
                ?.label.toLocaleLowerCase("vi"),
            ),
          )}
          onClose={() => setOptionsProduct(null)}
          onConfirm={confirmAddToCart}
        />
      )}
      <CartDrawer
        cart={cart}
        cartCount={cartCount}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onQuantityChange={changeQuantity}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart({})}
        onLoginRequest={() => setAuthOpen(true)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
