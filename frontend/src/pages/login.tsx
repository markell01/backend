import { useState } from "react";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = {
      username,
      password
    }
    
    try {
      const response = await authService.login(data);
      toast.success("Вы успешно вошли!", {
        containerId: "app-toast"
      })
      navigate("/")
      console.log(response.data);
    } catch(err) {
      toast.error("Что-то пошло не так!", {
        position: "top-right",
        containerId: "app-toast",
      });
      console.error(err);
    }
  }

  return (
    <>
      <div className="h-screen">
        <div className="flex flex-col justify-center items-center min-h-full">
          <div className="w-5/14 h-3/12 gap-10 justify-between items-center flex flex-col shadow-lg p-6 rounded-lg">
            <div className="items-center flex flex-col">
              <h1 className="text-5xl text-primary">Printing duel</h1>
              <p className="text-2xl text-primary">
                Соревнуйся в скорости печати в реальном времени
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full justify-center items-center">
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                type="text"
                className="border rounded-lg p-2 w-[50%]"
                placeholder="Логин"
              />

              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className="border rounded-lg p-2 w-[50%]"
                placeholder="Пароль"
              />

              <button className="text-primary p-2 w-[45%] bg-indigo-500 rounded-lg hover:scale-110 hover:bg-fuchsia-500 transition ease-linear text-white">
                Войти
              </button>
            </form>
            <div className="w-full flex justify-center">
              <p>Или <Link to={"/registration"} className="text-indigo-500 hover:text-fuchsia-500 transition ease-linear"> зарегистрироваться</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
