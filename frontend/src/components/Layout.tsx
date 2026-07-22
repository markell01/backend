import React, { useEffect } from "react";
import { User, LogOut, Swords } from "lucide-react"; // Swords отлично подойдет для игры "Printing Duel"
import { useAuthModal } from "../context/AuthModalContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { openAuthModal } = useAuthModal();
  const [userName, setUserName] = React.useState<string>("");

  useEffect(() => {
    // Подтягиваем имя пользователя из localStorage при монтировании
    setUserName(localStorage.getItem("username") || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId"); // Если будете сохранять и id
    window.location.reload(); // Быстро обновляем страницу, чтобы сбросить стейт
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Красивая шапка (Header) */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Логотип / Название игры */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Swords className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">
              Printing Duel
            </span>
          </div>

          {/* Блок пользователя справа */}
          <div className="flex items-center gap-4">
            {userName ? (
              // Авторизованный пользователь
              <div className="flex items-center gap-3 bg-gray-50 p-1.5 pr-3 rounded-xl border border-gray-100">
                {/* Аватарка */}
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>

                {/* Имя */}
                <span className="text-sm font-medium text-gray-700">
                  {userName}
                </span>

                {/* Вертикальный разделитель */}
                <div className="w-px h-4 bg-gray-200 mx-1" />

                {/* Кнопка Выйти */}
                <button
                  onClick={handleLogout}
                  title="Выйти из аккаунта"
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Если гость
              <button
                onClick={() => {openAuthModal()}}
                className="flex gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Войти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Контейнер для основного контента страниц */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
