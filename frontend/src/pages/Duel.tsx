import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
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
import { useTypingEngine } from "../hooks/useTypingEngine";
import { TypingArea } from "../components/match/TypingArea";

const DUEL_DURATION_SECONDS = 60;
const SOCKET_URL =
  import.meta.env.VITE_API_URL ?? "http://192.168.0.158:3000";

interface Player {
  userId: string;
  username: string;
  typedLength: number;
  correctChars: number;
  mistakes: number;
  accuracy: number;
  cpm: number;
  wpm: number;
}

interface DuelFinalStats extends Player {
  finishedAt: number;
}

interface DuelFinishedPayload {
  duelId: string;
  reason: "time" | "all_players_finished";
  winnerId: string | null;
  results: DuelFinalStats[];
}

type GameStatus = "WAITING" | "COUNTDOWN" | "ACTIVE" | "FINISHED";
type ServerDuelStatus = "created" | "countdown" | "active" | "finished";

interface DuelJoinedPayload {
  text: string;
  players: Player[];
  status: ServerDuelStatus;
  startedAt?: number;
  endsAt?: number;
  durationMs: number;
}

export default function Duel() {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  const [words, setWords] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("WAITING");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION_SECONDS);
  const [finalStats, setFinalStats] = useState<DuelFinishedPayload | null>(
    null,
  );
  const [hasSubmittedFinal, setHasSubmittedFinal] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const finalSubmittedRef = useRef(false);

  const isTypingDisabled = gameStatus !== "ACTIVE" || hasSubmittedFinal;

  const clearDuelTimer = useCallback(() => {
    if (!timerIntervalRef.current) return;

    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }, []);

  const startClientTimer = useCallback(
    (startedAt: number, endsAt: number) => {
      const serverOffset = startedAt - Date.now();

      clearDuelTimer();

      const tick = () => {
        const currentServerTime = Date.now() + serverOffset;
        const remainingSeconds = Math.max(
          0,
          Math.ceil((endsAt - currentServerTime) / 1000),
        );

        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) {
          clearDuelTimer();
        }
      };

      tick();
      timerIntervalRef.current = window.setInterval(tick, 250);
    },
    [clearDuelTimer],
  );

  const submitFinalStats = useCallback(
    (value: string) => {
      if (!socketRef.current || !duelId || !userId || finalSubmittedRef.current)
        return;

      finalSubmittedRef.current = true;
      setHasSubmittedFinal(true);
      socketRef.current.emit("duelFinish", {
        duelId,
        userId,
        inputValue: value,
      });
    },
    [duelId, userId],
  );

  const { inputValue, letters, handleInputChange, calculateStats } =
    useTypingEngine({
      words,
      isFinished: isTypingDisabled,
      onFirstInput: () => {},
      onComplete: submitFinalStats,
    });

  useEffect(() => {
    if (gameStatus !== "COUNTDOWN") return;

    const countdownInterval = window.setInterval(() => {
      setCountdown((prev) => Math.max(1, prev - 1));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [gameStatus]);

  useEffect(() => {
    if (!duelId) return;

    if (!userId) {
      toast.error("Войдите в аккаунт, чтобы играть дуэль.");
      navigate("/");
      return;
    }

    const socket = io(`${SOCKET_URL}/duels`, {
      autoConnect: true,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinDuel", { duelId, userId });
    });

    socket.on("duelJoined", (data: DuelJoinedPayload) => {
      setWords(data.text);
      setPlayers(data.players);
      setTimeLeft(Math.ceil(data.durationMs / 1000));

      if (data.status === "countdown") {
        setGameStatus("COUNTDOWN");
      }

      if (data.status === "active" && data.startedAt && data.endsAt) {
        setGameStatus("ACTIVE");
        startClientTimer(data.startedAt, data.endsAt);
      }
    });

    socket.on("duelCountdown", (data: { startsIn: number }) => {
      setGameStatus("COUNTDOWN");
      setCountdown(data.startsIn);
    });

    socket.on(
      "duelStart",
      (data: { startedAt: number; endsAt: number; durationMs: number }) => {
        finalSubmittedRef.current = false;
        setHasSubmittedFinal(false);
        setGameStatus("ACTIVE");
        setTimeLeft(Math.ceil(data.durationMs / 1000));
        startClientTimer(data.startedAt, data.endsAt);
      },
    );

    socket.on(
      "duelProgressTick",
      (data: { duelId: string; players: Player[] }) => {
        if (data.duelId === duelId) {
          setPlayers(data.players);
        }
      },
    );

    socket.on("duelFinishAccepted", () => {
      setHasSubmittedFinal(true);
    });

    socket.on("duelFinished", (result: DuelFinishedPayload) => {
      clearDuelTimer();
      setGameStatus("FINISHED");
      setFinalStats(result);
      setPlayers(result.results);
    });

    socket.on("duelError", (data: { message: string }) => {
      toast.error(data.message || "Ошибка дуэли");
    });

    socket.on("connect_error", () => {
      toast.error("Не удалось подключиться к серверу дуэлей.");
      navigate("/");
    });

    return () => {
      clearDuelTimer();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clearDuelTimer, duelId, navigate, startClientTimer, userId]);

  useEffect(() => {
    if (
      gameStatus !== "ACTIVE" ||
      hasSubmittedFinal ||
      !socketRef.current ||
      !duelId ||
      !userId
    ) {
      return;
    }

    const elapsedTimeSec = Math.max(1, DUEL_DURATION_SECONDS - timeLeft);
    const currentStats = calculateStats(elapsedTimeSec);

    socketRef.current.emit("updateProgress", {
      duelId,
      userId,
      typedLength: inputValue.length,
      correctChars: currentStats.correctChars,
      mistakes: currentStats.mistakes,
      accuracy: currentStats.accuracy,
      cpm: currentStats.cpm,
      wpm: Math.round(currentStats.cpm / 5),
    });
  }, [
    calculateStats,
    duelId,
    gameStatus,
    hasSubmittedFinal,
    inputValue,
    timeLeft,
    userId,
  ]);

  useEffect(() => {
    if (gameStatus === "ACTIVE" && timeLeft <= 0) {
      submitFinalStats(inputValue);
    }
  }, [gameStatus, inputValue, submitFinalStats, timeLeft]);

  const myPlayer = players.find((player) => player.userId === userId);
  const opponent = players.find((player) => player.userId !== userId);
  const myResult = finalStats?.results.find((item) => item.userId === userId);
  const opponentResult = finalStats?.results.find(
    (item) => item.userId !== userId,
  );
  const isWinner = finalStats?.winnerId === userId;
  const isDraw = finalStats?.winnerId === null;

  const resultTitle = isDraw
    ? "Ничья"
    : isWinner
      ? "Вы победили!"
      : "Вы проиграли";
  const resultDescription = isDraw
    ? "Вы с соперником показали одинаковый результат."
    : isWinner
      ? "Вы напечатали точнее и быстрее соперника."
      : "Соперник оказался быстрее в этой дуэли.";

  return (
    <div className="relative w-full flex items-center flex-col pt-8 p-6 gap-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center w-full bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">Дуэль</h1>
        </div>

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

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-2 text-indigo-600">
              <User className="w-4 h-4" /> Вы ({myPlayer?.username || "Игрок"})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-600">
                {myPlayer?.correctChars || 0} символов
              </span>
              <span className="font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-600">
                {myPlayer?.wpm || 0} WPM
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              {opponent?.username || "Ожидание соперника..."}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                {opponent?.correctChars || 0} символов
              </span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                {opponent?.wpm || 0} WPM
              </span>
            </div>
          </div>
        </div>
      </div>

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

        {hasSubmittedFinal && gameStatus === "ACTIVE" && (
          <div className="absolute inset-0 z-20 bg-white/75 backdrop-blur-xs rounded-2xl flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
              Финиш принят, ждем соперника
            </span>
          </div>
        )}
      </div>

      {gameStatus === "FINISHED" && finalStats && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
            {isWinner || isDraw ? (
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
                {resultTitle}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {resultDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" /> WPM
                </div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {myResult?.wpm ?? 0}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Target className="w-3.5 h-3.5 text-indigo-500" /> Точность
                </div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {myResult?.accuracy ?? 0}%
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Ваши символы</div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {myResult?.correctChars ?? 0}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">Соперник</div>
                <span className="text-2xl font-bold font-mono text-gray-800">
                  {opponentResult?.correctChars ?? 0}
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
