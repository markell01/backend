import { useState } from "react";
import { authService } from "../services/auth.service";
import { toast } from "react-toastify";

export default function Registration() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = {
      username,
      password
    }
    
    try {
      const response = await authService.register(data);
      toast.success("Вы успешно зарегистрировались!", {
        position: "top-right",
        containerId: "app-toast"
      })
      console.log(response.data);
    } catch(err) {
      toast.error("Error Notification !", {
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
                Зарегистрироваться
              </button>
            </form>
            <div className="flex justify-between w-full">
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
