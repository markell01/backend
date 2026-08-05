import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { registerModalTrigger } from "./services/instance";
import { useAuthModal } from "./context/AuthModalContext";
import AuthModalContainer from "./components/AuthModalContainer";
import Home from "./pages/home";
import Match from "./pages/match";
import Duel from "./pages/Duel";

function App() {
  const { isOpen, openAuthModal, closeAuthModal } = useAuthModal();

  useEffect(() => {
    registerModalTrigger(openAuthModal);
  }, [openAuthModal]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Layout>
          <Home />
        </Layout>
      ),
    },
    {
      path: "/match",
      element: (
        <Layout>
          <Match />
        </Layout>
      ),
    },
    {
      path: "/duel/:duelId",
      element: (
        <Layout>
          <Duel />
        </Layout>
      ),
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" containerId="app-toast" />
      {isOpen && <AuthModalContainer onClose={closeAuthModal} />}
    </>
  );
}

export default App;
