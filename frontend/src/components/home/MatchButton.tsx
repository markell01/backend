// components/home/MatchButton.tsx
import type { JSX } from "react/jsx-runtime";
import { Loader2, X } from "lucide-react";

interface MatchButtonProps {
  title: string;
  description: string;
  onClick: () => void | Promise<void>;
  icon: JSX.Element;
  isSearching?: boolean;
  searchTime?: number;
}

const MatchButton = ({
  title,
  description,
  onClick,
  icon,
  isSearching = false,
  searchTime = 0,
}: MatchButtonProps) => {
  // Форматирование секунд в 00:00
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={onClick}
      className={`group relative w-1/3 h-64 cursor-pointer rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl ${
        isSearching
          ? "bg-indigo-700 ring-2 ring-indigo-400 ring-offset-2"
          : "bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-1"
      } text-white`}
    >
      {/* Шапка карточки: Иконка или Лоадер */}
      <div className="flex justify-between items-center w-full">
        <div className="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-xs group-hover:scale-110 transition-transform">
          {isSearching ? (
            <Loader2 className="w-8 h-8 text-indigo-200 animate-spin" />
          ) : (
            icon
          )}
        </div>

        {/* Кнопка отмены при поиске */}
        {isSearching && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 text-red-200 text-xs font-semibold rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" />
            <span>Отмена</span>
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div>
        {isSearching ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-xl font-bold">Поиск соперника...</h3>
            </div>
            <p className="text-indigo-200 text-sm font-mono font-medium">
              Время в очереди: {formatTime(searchTime)}
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold mb-1">{title}</h3>
            <p className="text-indigo-200 text-sm font-medium">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchButton;
