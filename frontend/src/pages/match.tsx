import { useEffect, useRef, useState } from "react";
import { RotateCcw, Timer } from "lucide-react";
import { soloMatchService } from "../services/soloMatch.service";

interface statusCssMapType {
  correct: string;
  incorrect: string;
  untyped: string;
  current: string;
}

interface letterType {
  letter: string;
  status: "correct" | "incorrect" | "untyped" | "current";
}

const INITIAL_TIME = 60;

export default function Match() {
  const [inputValue, setInputValue] = useState("");
  const [words, setWords] = useState("");
  const [matchId, setMatchId] = useState("");

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentLetterRef = useRef<HTMLSpanElement>(null);

  const createMatch = async () => {
    try {
      const userId = localStorage.getItem("id");
      if (userId) {
        const response = await soloMatchService.createMatch({ userId });
        setWords(response.data.text);
        setMatchId(response.data.match.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startMatch = async () => {
    try {
      await soloMatchService.startMatch({ matchId });
    } catch (error) {
      console.log(error);
    }
  };

  const finishMatch = async () => {
    try {
      const userId = localStorage.getItem("id");
      if (!userId || !matchId) return;

      let correctChars = 0;
      let mistakes = 0;

      // Считаем правильные и ошибочные символы
      inputValue.split("").forEach((char, index) => {
        if (char === words[index]) {
          correctChars++;
        } else {
          mistakes++;
        }
      });

      const elapsedTime = INITIAL_TIME - timeLeft || 1; // Защита от деления на 0

      // 2. Точность всех нажатий клавиш (%)
      const accuracy =
        totalKeystrokesRef.current > 0
          ? Math.round(
              (correctKeystrokesRef.current / totalKeystrokesRef.current) * 100,
            )
          : 0;

      // 3. Символы в минуту (CPM)
      const cpm = Math.round((correctChars / elapsedTime) * 60);

      const countWords = (inputValue: string) => {
        return inputValue
          .trim()
          .split(/\s+/)
          .filter((word) => word !== "").length;
      };

      const wordsCount = countWords(inputValue);

      const wpm = Math.round((wordsCount / elapsedTime) * 60);

      const payload = {
        userId,
        correctChars,
        accuracy,
        mistakes,
        cpm,
        wpm,
      };

      await soloMatchService.finishMatch(matchId, payload);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    createMatch();
  }, []);

  const handleRestart = () => {
    setInputValue("");
    setTimeLeft(INITIAL_TIME);
    setIsStarted(false);
    setIsFinished(false);
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    createMatch();

    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  useEffect(() => {
    let timer: number;

    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      setIsFinished(true);
      setIsStarted(false);
      finishMatch();
    }

    return () => clearInterval(timer);
  }, [timeLeft, isStarted, isFinished]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      startMatch();
    }

    if (val.length > inputValue.length) {
      const addedCharIndex = val.length - 1;
      totalKeystrokesRef.current += 1;

      if (val[addedCharIndex] === words[addedCharIndex]) {
        correctKeystrokesRef.current += 1;
      }
    }

    setInputValue(val);
  };

  useEffect(() => {
    if (!isFinished) {
      inputRef.current?.focus({ preventScroll: true });
    }

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const isInteractive = target.closest(
        "button, a, input, textarea, select, [role='button']",
      );

      if (!isInteractive) {
        inputRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [isFinished]);

  useEffect(() => {
    if (currentLetterRef.current && !isFinished) {
      currentLetterRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [inputValue, isFinished]);

  const letters: letterType[] = words.split("").map((item, index) => {
    if (index === inputValue.length) {
      return { letter: item, status: "current" };
    }
    if (index > inputValue.length) {
      return { letter: item, status: "untyped" };
    }
    if (inputValue[index] === words[index]) {
      return { letter: item, status: "correct" };
    }
    return { letter: item, status: "incorrect" };
  });

  const statusCssMap: statusCssMapType = {
    correct: "text-green-500",
    incorrect: "text-red-500",
    untyped: "text-gray-400",
    current:
      "text-gray-400 relative before:absolute before:-left-[1px] before:top-[10%] before:bottom-[10%] before:w-[2px] before:bg-indigo-600 before:animate-pulse",
  };

  return (
    <div className="w-full flex items-center flex-col pt-10 gap-6">
      <div className="w-full max-w-4xl flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600 font-mono">
          <Timer className="w-6 h-6" />
          <span>{timeLeft}s</span>
        </div>
        <button
          onClick={handleRestart}
          title="Заново"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Заново
        </button>
      </div>

      <div className="relative w-full max-w-4xl p-4 rounded-2xl min-h-40">
        <div
          className={`h-27 overflow-hidden relative transition-all duration-300 ${isFinished ? "blur-xs select-none pointer-events-none opacity-50" : ""}`}
        >
          <p className="font-mono text-2xl leading-9 tracking-wide select-none wrap-break-word">
            {letters.map((item: letterType, index) => {
              const isCurrent = item.status === "current";
              return (
                <span
                  key={index}
                  ref={isCurrent ? currentLetterRef : null}
                  className={`transition-colors duration-100 ${statusCssMap[item.status]}`}
                >
                  {item.letter}
                </span>
              );
            })}
          </p>
        </div>

        {isFinished && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/10 backdrop-blur-xs rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Время вышло!</h2>

            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Начать заново
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          id="input"
          aria-label={words}
          disabled={isFinished}
          className="absolute top-0 left-0 h-8 opacity-0 pointer-events-none w-full"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          autoComplete="off"
        />
      </div>
    </div>
  );
}
