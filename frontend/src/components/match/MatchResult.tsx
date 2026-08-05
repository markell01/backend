import { Zap, Target, AlertTriangle, RotateCcw, Activity } from "lucide-react";
import { motion } from "framer-motion";

export interface MatchStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakes: number;
  correctChars: number;
}

interface MatchResultProps {
  stats: MatchStats;
  onRestart: () => void;
}

export const MatchResult = ({ stats, onRestart }: MatchResultProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Результаты матча
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-6">
        {/* WPM */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-102">
          <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              WPM
            </span>
          </div>
          <span className="text-3xl font-extrabold font-mono text-indigo-600">
            {stats.wpm}
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">
            слов / мин
          </span>
        </div>

        {/* CPM */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-102">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              CPM
            </span>
          </div>
          <span className="text-3xl font-extrabold font-mono text-gray-800">
            {stats.cpm}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            симв / мин
          </span>
        </div>

        {/* Accuracy */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-102">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Точность
            </span>
          </div>
          <span className="text-3xl font-extrabold font-mono text-gray-800">
            {stats.accuracy}%
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            всех кликов
          </span>
        </div>

        {/* Mistakes */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-102">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Ошибки
            </span>
          </div>
          <span className="text-3xl font-extrabold font-mono text-gray-800">
            {stats.mistakes}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            символов
          </span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
        Начать заново
      </button>
    </motion.div>
  );
};
