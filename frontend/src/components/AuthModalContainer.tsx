import { useState } from "react";
import { X } from "lucide-react";
import LoginTab from "./LoginTab";
import RegistrationTab from "./RegistrationTab";

interface AuthModalContainerProps {
  onClose: () => void;
}

export default function AuthModalContainer({
  onClose,
}: AuthModalContainerProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl p-8 z-10 transition-all duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative flex border-b border-gray-100 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative z-10 cursor-pointer ${
              activeTab === "login"
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative z-10 cursor-pointer ${
              activeTab === "register"
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Регистрация
          </button>

          <div
            className={`absolute bottom-0 left-0 h-0.5 w-1/2 bg-indigo-600 transition-transform duration-300 ease-out ${
              activeTab === "register" ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </div>

        {activeTab === "login" ? (
          <LoginTab onSuccess={onClose} />
        ) : (
          <RegistrationTab onRegisterSuccess={() => setActiveTab("login")} />
        )}
      </div>
    </div>
  );
}
