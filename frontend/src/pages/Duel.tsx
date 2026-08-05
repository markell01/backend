// pages/Duel.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import { useTypingEngine } from "../hooks/useTypingEngine";
import {
  User,
  Swords,
  Trophy,
  XCircle,
  RotateCcw,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { TypingArea } from "../components/match/TypingArea";

interface Player {
  userId: string;
  username: string;
  typedLength: number; // Количество правильно введенных символов
  wpm: number;
}

interface EndGameStats {
  winnerId: string;
  myStats: {
    wpm: number;
    accuracy: number;
    charsTyped: number;
  };
  opponentStats: {
    wpm: number;
    accuracy: number;
    charsTyped: number;
  };
}

type GameStatus = "WAITING" | "COUNTDOWN" | "ACTIVE" | "FINISHED";

export default function Duel() {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  const [words, setWords] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("WAITING");
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60); // Серверный таймер на 60 сек
  const [finalStats, setFinalStats] = useState<EndGameStats | null>(null);

  const timerIntervalRef = useRef<number | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const isTypingDisabled = gameStatus !== "ACTIVE";

  // Берем из движка печати все данные для синхронизации с бэком
  const { inputValue, letters, handleInputChange, calculateStats } =
    useTypingEngine({
      words,
      isFinished: isTypingDisabled,
      onFirstInput: () => {},
    });

  // 1. Подключение к сокету дуэли
  useEffect(() => {
    if (!duelId || !userId) return;

    const socket = io("http://192.168.0.158:3000/duels", {
      autoConnect: true,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinDuel", { duelId, userId });
    });

    socket.on("duelJoined", (data: { text: string; players: Player[] }) => {
      setWords(data.text);
      setPlayers(data.players);
    });

    // Обратный отсчет перед стартом (3... 2... 1...)
    socket.on("duelCountdown", (data: { startsIn: number }) => {
      setGameStatus("COUNTDOWN");
      setCountdown(data.startsIn);
    });

    // Старт матча на 60 секунд
    socket.on("duelStart", (data: { startedAt: number; endsAt: number }) => {
      setGameStatus("ACTIVE");
      // Вычисляем разницу между часами сервера и клиента
      const serverOffset = data.startedAt - Date.now();

      // Очищаем старый интервал, если он был
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      // Запускаем локальный таймер обновления UI (можно 250ms для точности)
      timerIntervalRef.current = setInterval(() => {
        const currentServerTime = Date.now() + serverOffset;
        const remainingSeconds = Math.max(
          0,
          Math.ceil((data.endsAt - currentServerTime) / 1000),
        );

        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
      }, 250);
    });

    // Обновление прогресса игроков во время боя
    socket.on(
      "duelProgressTick",
      (data: { duelId: string; players: Player[] }) => {
        console.log(data);
        setPlayers(data.players);
      },
    );

    // Финиш 60 секунд
    socket.on("duelFinished", (result: EndGameStats) => {
      setGameStatus("FINISHED");
      setFinalStats(result);
    });

    return () => {
      socket.disconnect();
    };
  }, [duelId, userId]);

  useEffect(() => {
    if (gameStatus !== "ACTIVE" || !socketRef.current) return;

    // 1. Считаем прошедшее время в секундах (не меньше 1, чтобы не было деления на 0)
    const elapsedTimeSec = Math.max(1, 60 - timeLeft);

    // 2. Вызываем метод расчета из хука
    const currentStats = calculateStats(elapsedTimeSec);
    const correctCharsCount = letters.filter(
      (l) => l.status === "correct",
    ).length;

    // 3. Отправляем на бэк
    socketRef.current.emit("updateProgress", {
      duelId,
      username: myPlayer?.username,
      typedLength: correctCharsCount,
      wpm: currentStats.wpm,
    });
  }, [inputValue, letters, gameStatus, duelId, userId, timeLeft]);

  const myPlayer = players.find((p) => p.userId === userId);
  const opponent = players.find((p) => p.userId !== userId);
  const isWinner = finalStats?.winnerId === userId;

  return (
    <div className="relative w-full flex items-center flex-col pt-8 p-6 gap-6 max-w-5xl mx-auto">
      {/* Шапка дуэли и Серверный Таймер */}
      <div className="flex justify-between items-center w-full bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">Дуэль</h1>
        </div>

        {/* Таймер дуэли */}
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100">
          <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
          <span className="font-mono text-xl font-extrabold text-indigo-600">
            {timeLeft}s
          </span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
        >
          Покинуть дуэль
        </button>
      </div>

      {/* Прогресс игроков (Количество набранных символов) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Мой прогресс */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-2 text-indigo-600">
              <User className="w-4 h-4" /> Вы ({myPlayer?.username || "Игрок"})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-600">
                {myPlayer?.typedLength || 0} символов
              </span>
              <span className="font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-600">
                {myPlayer?.wpm || 0} WPM
              </span>
            </div>
          </div>
        </div>

        {/* Прогресс соперника */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              {opponent?.username || "Ожидание соперника..."}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                {opponent?.typedLength || 0} символов
              </span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                {opponent?.wpm || 0} WPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Зона ввода */}
      <div className="relative w-full flex justify-center">
        {words ? (
          <TypingArea
            words={words}
            inputValue={inputValue}
            letters={letters}
            isFinished={isTypingDisabled}
            onInputChange={handleInputChange}
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 font-medium animate-pulse">
            Подключение к дуэли...
          </div>
        )}

        {/* Оверлей обратного отсчета */}
        {gameStatus === "COUNTDOWN" && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
            <span className="text-6xl font-black text-indigo-600 animate-bounce">
              {countdown}
            </span>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Приготовьтесь!
            </span>
          </div>
        )}
      </div>

      {/* Модальное окно итогов 60 секунд */}
      {gameStatus === "FINISHED" && finalStats && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
            {isWinner ? (
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                <Trophy className="w-12 h-12" />
              </div>
            ) : (
              <div className="p-4 bg-red-100 text-red-500 rounded-full">
                <XCircle className="w-12 h-12" />
              </div>
            )}

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {isWinner ? "Вы победили!" : "Вы проиграли"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isWinner
                  ? "Вы напечатали больше символов за 60 секунд!"
                  : "Соперник успел набрать больше текста."}
              </p>
            </div>

            {/* Сетка финишных результатов */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" /> WPM
                </div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {finalStats.myStats.wpm}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Target className="w-3.5 h-3.5 text-indigo-500" /> Точность
                </div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {finalStats.myStats.accuracy}%
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Вернуться в меню
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
