import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RestaurantProvider } from "./context/RestaurantContext.jsx";
import "../styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RestaurantProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RestaurantProvider>
  </React.StrictMode>,
);
