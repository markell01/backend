import { useNavigate } from "react-router";
import { User, Swords, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { leaderBoardService } from "../services/leaderBoard.service";
import Leaderboard from "../components/home/Leaderboard";

const Home = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  const getLeaderBoard = async () => {
    try {
      const response = await leaderBoardService.getLeaderBoard();
      console.log(response.data.goats);

      setLeaderboard(response.data.goats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLeaderBoard();
  }, []);
  return (
    <div className="flex items-center flex-col gap-6 p-6 bg-gray-50">
      <div className="w-full max-w-5xl flex gap-6 justify-center">
        {/* Соло матч */}
        <div
          onClick={() => navigate("/match")}
          className="group relative bg-indigo-600 hover:bg-indigo-500 text-white w-1/3 h-64 cursor-pointer rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1"
        >
          <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-xs group-hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Соло матч</h3>
            <p className="text-indigo-200 text-sm font-medium">
              Тренировка скорости в одиночку
            </p>
          </div>
        </div>

        {/* Начать дуэль */}
        <div
          onClick={() => navigate("/match")}
          className="group relative bg-indigo-600 hover:bg-indigo-500 text-white w-1/3 h-64 cursor-pointer rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1"
        >
          <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-xs group-hover:scale-110 transition-transform">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Начать дуэль</h3>
            <p className="text-indigo-200 text-sm font-medium">
              Быстрый поиск соперника 1v1
            </p>
          </div>
        </div>

        {/* Приватный матч */}
        <div
          onClick={() => navigate("/match")}
          className="group relative bg-indigo-600 hover:bg-indigo-500 text-white w-1/3 h-64 cursor-pointer rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1"
        >
          <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-xs group-hover:scale-110 transition-transform">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Приватный матч</h3>
            <p className="text-indigo-200 text-sm font-medium">
              Комната для игры с друзьями
            </p>
          </div>
        </div>
      </div>

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default Home;
