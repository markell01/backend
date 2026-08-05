import { useState, useRef } from "react";

export interface LetterState {
  letter: string;
  status: "correct" | "incorrect" | "untyped" | "current";
}

interface UseTypingEngineProps {
  words: string;
  isFinished: boolean;
  onFirstInput?: () => void;
  onComplete?: (inputValue: string) => void;
}

export const useTypingEngine = ({
  words,
  isFinished,
  onFirstInput,
  onComplete,
}: UseTypingEngineProps) => {
  const [inputValue, setInputValue] = useState("");
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;

    // Срабатывает при первом вводе символа (например, для старта таймера)
    if (inputValue.length === 0 && val.length > 0 && onFirstInput) {
      onFirstInput();
    }

    // Подсчет кликов
    if (val.length > inputValue.length) {
      const addedIndex = val.length - 1;
      totalKeystrokesRef.current += 1;
      if (val[addedIndex] === words[addedIndex]) {
        correctKeystrokesRef.current += 1;
      }
    }

    setInputValue(val);

    // Завершение при допечатывании до конца
    if (val.length >= words.length && words.length > 0 && onComplete) {
      onComplete(val);
    }
  };

  const resetEngine = () => {
    setInputValue("");
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
  };

  // Расчет метрик для отправки на бэк
  const calculateStats = (elapsedTimeSec: number) => {
    let correctChars = 0;
    let mistakes = 0;

    inputValue.split("").forEach((char, index) => {
      if (char === words[index]) correctChars++;
      else mistakes++;
    });

    const safeTime = elapsedTimeSec || 1;
    const accuracy =
      totalKeystrokesRef.current > 0
        ? Math.round(
            (correctKeystrokesRef.current / totalKeystrokesRef.current) * 100,
          )
        : 0;

    const cpm = Math.round((correctChars / safeTime) * 60);

    const wordsCount = inputValue
      .trim()
      .split(/\s+/)
      .filter((w) => w !== "").length;
    const wpm = Math.round((wordsCount / safeTime) * 60);

    return { correctChars, accuracy, mistakes, cpm, wpm };
  };

  // Формирование массива букв со статусами
  const letters: LetterState[] = words.split("").map((item, index) => {
    if (index === inputValue.length) return { letter: item, status: "current" };
    if (index > inputValue.length) return { letter: item, status: "untyped" };
    if (inputValue[index] === words[index])
      return { letter: item, status: "correct" };
    return { letter: item, status: "incorrect" };
  });

  return {
    inputValue,
    letters,
    handleInputChange,
    resetEngine,
    calculateStats,
  };
};
