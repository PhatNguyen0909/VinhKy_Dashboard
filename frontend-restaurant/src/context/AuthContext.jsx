import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL } from "../hooks/useMenu.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "vk_token";

async function request(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Có lỗi xảy ra, vui lòng thử lại.",
    );
  }
  return data;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [customer, setCustomer] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    request("/auth/me", { token }).then(setCustomer).catch(logout);
  }, [token, logout]);

  const accept = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setCustomer(data.customer);
  }, []);

  const value = useMemo(
    () => ({
      token,
      customer,
      logout,
      login: async (phone, password) =>
        accept(await request("/auth/login", { method: "POST", body: { phone, password } })),
      register: async (form) =>
        accept(await request("/auth/register", { method: "POST", body: form })),
      myOrders: () => request("/orders/mine", { token }),
      updateProfile: async (body) =>
        setCustomer(await request("/auth/me", { token, method: "PATCH", body })),
    }),
    [token, customer, logout, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
