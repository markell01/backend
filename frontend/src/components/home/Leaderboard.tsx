import { Trophy, Award } from "lucide-react";

// Типизация данных с бэкенда
interface LeaderboardItem {
  id: string;
  wpm: number;
  correctChars: number;
  accuracy: number;
  mistakes: number;
  cpm: number;
  userId: string;
  user: {
    username: string;
  };
}

interface LeaderboardProps {
  leaderboard: LeaderboardItem[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  // Функция для отрисовки бейджей Топ-3 мест
  const renderRank = (index: number) => {
    const rank = index + 1;

    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-bold">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold">
          <Award className="w-5 h-5 text-slate-400" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/10 text-amber-800 font-bold">
          <Award className="w-5 h-5 text-amber-700" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-gray-400">
        {rank}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Таблица лидеров</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-sm font-semibold uppercase tracking-wider">
              <th className="pb-3 px-3 w-16 text-center">#</th>
              <th className="pb-3 px-4">Игрок</th>
              <th className="pb-3 px-4 text-right">WPM</th>
              <th className="pb-3 px-4 text-right">CPM</th>
              <th className="pb-3 px-4 text-right">Точность</th>
              <th className="pb-3 px-4 text-right">Ошибки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leaderboard.map((item, index) => {
              const isTop3 = index < 3;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-indigo-50/40 transition-colors ${
                    isTop3 ? "bg-gray-50/50 font-medium" : ""
                  }`}
                >
                  {/* Ранг / Место */}
                  <td className="py-3 px-3 flex justify-center">
                    {renderRank(index)}
                  </td>

                  {/* Имя пользователя */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        isTop3 ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {item.user.username}
                    </span>
                  </td>

                  {/* WPM */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                    {item.wpm}
                  </td>

                  {/* CPM */}
                  <td className="py-3 px-4 text-right font-mono text-gray-600">
                    {item.cpm}
                  </td>

                  {/* Точность */}
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        item.accuracy >= 95
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.accuracy}%
                    </span>
                  </td>

                  {/* Ошибки */}
                  <td className="py-3 px-4 text-right font-mono text-gray-500">
                    {item.mistakes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
