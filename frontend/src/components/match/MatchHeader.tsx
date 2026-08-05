import { Timer, RotateCcw } from "lucide-react";

interface MatchHeaderProps {
  timeLeft: number;
  onRestart?: () => void;
  showRestart?: boolean;
}

export const MatchHeader = ({
  timeLeft,
  onRestart,
  showRestart = true,
}: MatchHeaderProps) => {
  return (
    <div className="w-full max-w-4xl flex justify-between items-center px-2">
      <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600 font-mono">
        <Timer className="w-6 h-6" />
        <span>{timeLeft}s</span>
      </div>

      {showRestart && onRestart && (
        <button
          onClick={onRestart}
          title="Заново"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Заново
        </button>
      )}
    </div>
  );
};
