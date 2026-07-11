import { useState } from "react";

interface statusCssMapType {
  correct: string;
  incorrect: string;
  untyped: string;
}

interface letterType {
  letter: string;
  status: "correct" | "incorrect" | "untyped";
}

export default function Match() {
  const [inputValue, setInputValue] = useState("");
  const words = "gugu";

  const letters: any[] = words.split("").map((item, index) => {
      if (index >= inputValue.length) {
        return { letter: item, status: "untyped" };
      }
      if (inputValue[index] === words[index]) {
        return { letter: item, status: "correct" };
      }
      return { letter: item, status: "incorrect" };
  })

  const statusCssMap: statusCssMapType = {
    correct: "text-green-500",
    incorrect: "text-red-500",
    untyped: "text-gray-500",
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="relative">
        <p className="absolute pt-2 pl-2">
          {letters.map((item: letterType, index) => (
            <span key={index} className={`font-bold ${statusCssMap[item.status]}`}>
              {item.letter}
            </span>
          ))}
        </p>
        <input
          aria-label={words}
          className="border border-gray-300 text-white rounded-md p-2"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    </div>
  );
}
