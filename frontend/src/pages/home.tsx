// import { toast } from "react-toastify";
// import { authService } from "../services/auth.service";
import { useNavigate } from "react-router";

const home = () => {
  // const getInfo = async () => {
  //   try {
  //     await authService.me();

  //     toast.success("Вывел информацию в консоль", {
  //       containerId: "app-toast",
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Что-то пошло не так!", {
  //       containerId: "app-toast",
  //     });
  //   }
  // };
  const navigate = useNavigate();
  return (
    <div className="h-screen gap-4 flex justify-center items-center">
      {/* <button
        onClick={() => getInfo()}
        className="bg-violet-400 rounded-xl p-3"
      >
        получить инфо о себе
      </button> */}
      <button
        onClick={() => navigate("/match")}
        className="bg-indigo-600 cursor-pointer hover:bg-indigo-500 text-white rounded-xl p-3"
      >
        Начать матч
      </button>
    </div>
  );
};

export default home;
