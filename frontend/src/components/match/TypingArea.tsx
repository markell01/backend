import { useEffect, useRef } from "react";
import type { LetterState } from "../../hooks/useTypingEngine";
import { MatchResult, type MatchStats } from "./MatchResult";

interface TypingAreaProps {
  words: string;
  inputValue: string;
  letters: LetterState[];
  isFinished: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats?: MatchStats | null;
  onRestart?: () => void;
}

const statusCssMap = {
  correct: "text-green-500",
  incorrect: "text-red-500",
  untyped: "text-gray-400",
  current:
    "text-gray-400 relative before:absolute before:-left-[1px] before:top-[10%] before:bottom-[10%] before:w-[2px] before:bg-indigo-600 before:animate-pulse",
};

export const TypingArea = ({
  words,
  inputValue,
  letters,
  isFinished,
  stats = null,
  onInputChange,
  onRestart,
}: TypingAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLetterRef = useRef<HTMLSpanElement>(null);

  const showSoloResult = isFinished && Boolean(stats) && Boolean(onRestart);

  // Автофокус при клике вне кнопок
  useEffect(() => {
    if (!isFinished) inputRef.current?.focus({ preventScroll: true });

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        "button, a, input, textarea, select, [role='button']",
      );
      if (!isInteractive && !isFinished) {
        inputRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [isFinished]);

  // Скролл к текущей букве
  useEffect(() => {
    if (currentLetterRef.current && !isFinished) {
      currentLetterRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [inputValue, isFinished]);

  return (
    <div className="relative w-full max-w-4xl p-6 rounded-2xl min-h-70 flex flex-col justify-center">
      {/* 1. Блок с буквами: фиксированная высота h-27 только для него */}
      <div
        className={`h-27 overflow-hidden relative transition-all duration-500 ${
          showSoloResult ? "blur-sm select-none pointer-events-none opacity-30" : ""
        }`}
      >
        <p className="font-mono text-2xl leading-9 tracking-wide select-none wrap-break-word">
          {letters.map((item, index) => {
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

      {/* 2. Оверлей результатов: позиционируется поверх всего родительского карточного блока */}
      {showSoloResult && stats && onRestart && (
        <MatchResult stats={stats} onRestart={onRestart} />
      )}

      {/* Скрытый инпут */}
      <input
        ref={inputRef}
        id="input"
        aria-label={words}
        disabled={isFinished}
        className="absolute top-0 left-0 h-8 opacity-0 pointer-events-none w-full"
        type="text"
        value={inputValue}
        onChange={onInputChange}
        autoFocus
        autoComplete="off"
      />
    </div>
  );
};
