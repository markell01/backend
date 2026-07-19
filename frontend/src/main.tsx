import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import { AuthModalProvider } from "./context/AuthModalContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthModalProvider>
      <App />
    </AuthModalProvider>
  </StrictMode>,
);
