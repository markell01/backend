import { useState } from "react";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";
import { TailSpin } from "react-loader-spinner";

export default function Registration() {
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
      await authService.register(data);

      toast.success("Вы успешно зарегистрировались!", {
        position: "top-right",
        containerId: "app-toast",
      });

      navigate("/login");
    } catch (err) {
      toast.error("Error Notification !", {
        position: "top-right",
        containerId: "app-toast",
      });
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
              <h1 className="text-3xl font-bold">Регистрация</h1>
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
                {isLoading ? (
                  <TailSpin color="white" height={25} />
                ) : (
                  "Зарегистрироваться"
                )}
              </button>
            </form>
            <div className="w-full flex justify-center">
              <p>
                Или{" "}
                <Link
                  to={"/login"}
                  className="text-indigo-500 hover:text-fuchsia-500 transition ease-linear"
                >
                  {" "}
                  Авторизация
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
