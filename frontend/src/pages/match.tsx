import { useEffect, useState } from "react";
import { soloMatchService } from "../services/soloMatch.service";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { MatchHeader } from "../components/match/MatchHeader";
import { ErrorMessage } from "../components/match/ErrorMessage";
import { TypingArea } from "../components/match/TypingArea";
import type { MatchStats } from "../components/match/MatchResult";

const INITIAL_TIME = 60;

export default function Match() {
  const [words, setWords] = useState("");
  const [matchId, setMatchId] = useState("");
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  const createMatch = async () => {
    try {
      const userId = localStorage.getItem("id");
      if (userId) {
        const response = await soloMatchService.createMatch({ userId });
        setWords(response.data.text);
        setMatchId(response.data.match.id);
        setError(false);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const startMatch = async () => {
    try {
      await soloMatchService.startMatch({ matchId });
    } catch (err) {
      console.error(err);
    }
  };

  const finishMatch = async () => {
    try {
      const userId = localStorage.getItem("id");
      if (!userId || !matchId) return;

      const elapsedTime = INITIAL_TIME - timeLeft || 1;
      const stats = calculateStats(elapsedTime);

      setMatchStats(stats);

      const payload = { userId, ...stats };
      await soloMatchService.finishMatch(matchId, payload);
    } catch (err) {
      console.error(err);
    }
  };

  const {
    inputValue,
    letters,
    handleInputChange,
    resetEngine,
    calculateStats,
  } = useTypingEngine({
    words,
    isFinished,
    onFirstInput: () => {
      setIsStarted(true);
      startMatch();
    },
  });

  useEffect(() => {
    createMatch();
  }, []);

  const handleRestart = () => {
    resetEngine();
    setMatchStats(null);
    setTimeLeft(INITIAL_TIME);
    setIsStarted(false);
    setIsFinished(false);
    createMatch();
  };

  // Таймер
  useEffect(() => {
    let timer: number;
    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      setIsFinished(true);
      setIsStarted(false);
      finishMatch();
    }
    return () => clearInterval(timer);
  }, [timeLeft, isStarted, isFinished]);

  return (
    <div className="w-full flex items-center flex-col pt-10 gap-6">
      <MatchHeader timeLeft={timeLeft} onRestart={handleRestart} />

      {error ? (
        <ErrorMessage onRetry={handleRestart} />
      ) : (
        <TypingArea
          words={words}
          inputValue={inputValue}
          letters={letters}
          isFinished={isFinished}
          stats={matchStats}
          onInputChange={handleInputChange}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
