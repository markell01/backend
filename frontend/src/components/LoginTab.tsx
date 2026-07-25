import { useState } from "react";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import { isAxiosError } from "axios";
import { User, Lock } from "lucide-react";

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginTab({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const data = { username, password };

    try {
      const response = await authService.login(data);

      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("username", response.data.user.username);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error("Неправильный логин или пароль!", {
          containerId: "app-toast",
        });
      } else {
        toast.error("Что-то пошло не так!", {
          containerId: "app-toast",
        });
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Вход
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Добро пожаловать в Printing Duel!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700"
          >
            Логин
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <User className="w-5 h-5" />
            </span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              minLength={5}
              maxLength={12}
              placeholder="Введите логин"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400 text-sm shadow-sm"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Пароль
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              placeholder="Введите пароль"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400 text-sm shadow-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 py-3 px-4 w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl font-medium text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          {isLoading ? (
            <TailSpin color="white" height={20} width={20} />
          ) : (
            "Войти"
          )}
        </button>
      </form>
    </div>
  );
}
