import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorMessageProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

export const ErrorMessage = ({
  onRetry,
  title = "Произошла ошибка на сервере",
  description = "Не удалось загрузить данные. Попробуйте еще раз.",
}: ErrorMessageProps) => {
  return (
    <div className="w-full max-w-4xl bg-red-50/80 border border-red-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-4 text-center sm:text-left">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-red-950">{title}</h3>
          <p className="text-sm text-red-600/90 mt-0.5">{description}</p>
        </div>
      </div>

      <button
        onClick={onRetry}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-xl shadow-sm shadow-red-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <RotateCcw className="w-4 h-4" />
        Повторить
      </button>
    </div>
  );
};
