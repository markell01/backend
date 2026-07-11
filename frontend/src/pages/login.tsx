import { useState } from "react";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import { TailSpin } from "react-loader-spinner";
import { isAxiosError } from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      username,
      password,
    };

    try {
      await authService.login(data);

      toast.success("Вы успешно вошли!", {
        containerId: "app-toast",
      });

      navigate("/");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error("Неправильный логин или пароль!", {
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
    }
  }

  return (
    <>
      <div className="h-screen login_container">
        <div className="flex flex-col justify-center items-center min-h-full">
          <div className="w-95 border bg-white border-gray-200 gap-5 justify-between items-center flex flex-col shadow-lg p-10 rounded-lg">
            <div className="items-center flex flex-col">
              <h1 className="text-3xl font-bold">Логин</h1>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 w-full justify-center items-center"
            >
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-gray-400 focus:outline-1"
                placeholder="Логин"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-gray-400 focus:outline-1"
                placeholder="Пароль"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="p-2 w-full flex justify-center bg-indigo-500 rounded-lg hover:cursor-pointer hover:bg-fuchsia-500 transition ease-linear text-white"
              >
                {isLoading ? <TailSpin color="white" height={25} /> : "Войти"}
              </button>
            </form>
            <div className="w-full flex justify-center">
              <p>
                Или{" "}
                <Link
                  to={"/registration"}
                  className="text-indigo-500 hover:text-fuchsia-500 transition ease-linear"
                >
                  {" "}
                  зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
