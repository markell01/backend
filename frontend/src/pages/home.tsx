// pages/Home.tsx
import { User, Swords, Lock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client"; // 1. Импортируем Socket.IO
import { toast } from "react-toastify";
import { leaderBoardService } from "../services/leaderBoard.service";
import Leaderboard from "../components/home/Leaderboard";
import MatchButton from "../components/home/MatchButton";
import { useNavigate } from "react-router";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ?? "http://192.168.0.158:3000";

export const Home = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSearchingDuel, setIsSearchingDuel] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  // 2. Указываем правильный тип для Socket.IO
  const socketRef = useRef<Socket | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Очистка сокета и таймера
  const stopDuelSearch = () => {
    if (socketRef.current) {
      socketRef.current.disconnect(); // У Socket.IO используется .disconnect() вместо .close()
      socketRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsSearchingDuel(false);
    setSearchTime(0);
  };

  const handleToggleDuelSearch = () => {
    if (isSearchingDuel) {
      stopDuelSearch();
      return;
    }

    const userId = localStorage.getItem("id");

    if (!userId) {
      toast.error("Войдите в аккаунт, чтобы искать дуэль.");
      return;
    }

    setIsSearchingDuel(true);
    setSearchTime(0);

    // Запуск таймера
    timerIntervalRef.current = window.setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    // 3. Подключаемся через socket.io-client
    // В Socket.IO пространствa имён (namespaces) указываются в URL, а query-параметры — в объекте опций
    const socket = io(`${SOCKET_URL}/duels`, {
      autoConnect: true,
      withCredentials: true,
    });

    // Обработка успешного подключения
    socket.on("connect", () => {
      console.log("Socket.IO подключен. ID сокета:", socket.id);

      // 4. Вместо ws.send(JSON.stringify(...)) используем socket.emit('название_события', данные)
      socket.emit("findDuel", { userId });
    });

    // 5. Слушаем события от сервера по имени
    // Внутри Home.tsx
    socket.on("duelFound", (data: { duelId: string }) => {
      console.log("Найден дуэль-матч:", data);
      stopDuelSearch();
      navigate(`/duel/${data.duelId}`);
    });

    socket.on("waitingForOpponent", () => {
      console.log("Ожидание соперника для дуэли");
    });

    socket.on("duelError", (data: { message: string }) => {
      toast.error(data.message || "Ошибка поиска дуэли");
      stopDuelSearch();
    });

    // Обработка ошибок
    socket.on("connect_error", (error: Error) => {
      console.error("Ошибка подключения Socket.IO:", error);
      stopDuelSearch();
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO отключен");
    });

    socketRef.current = socket;
  };

  useEffect(() => {
    return () => {
      stopDuelSearch();
    };
  }, []);

  const getLeaderBoard = async () => {
    try {
      const response = await leaderBoardService.getLeaderBoard();
      setLeaderboard(response.data.goats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLeaderBoard();
  }, []);

  const BUTTONS = [
    {
      title: "Соло матч",
      description: "Тренировка скорости в одиночку",
      onClick: () => navigate("/match"),
      icon: <User className="w-8 h-8 text-white" />,
    },
    {
      title: "Начать дуэль",
      description: "Быстрый поиск соперника 1v1",
      onClick: handleToggleDuelSearch,
      icon: <Swords className="w-8 h-8 text-white" />,
      isSearching: isSearchingDuel,
      searchTime: searchTime,
    },
    {
      title: "Приватный матч",
      description: "Комната для игры с друзьями",
      onClick: () => navigate("/match"),
      icon: <Lock className="w-8 h-8 text-white" />,
    },
  ];

  return (
    <div className="flex items-center flex-col gap-6 p-6 bg-gray-50">
      <div className="w-full max-w-5xl flex gap-6 justify-center">
        {BUTTONS.map((button) => (
          <MatchButton
            key={button.title}
            title={button.title}
            description={button.description}
            onClick={button.onClick}
            icon={button.icon}
            isSearching={button.isSearching}
            searchTime={button.searchTime}
          />
        ))}
      </div>

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default Home;
