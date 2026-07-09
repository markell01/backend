import { useState } from 'react'

export default function Match() {
  const [inputValue, setInputValue] = useState("");
  const words = 'gugu'

  const letters: any[] = [];
  words.split('').map((item, index) => {
    if (index >= inputValue.length) {
      return { letter: item, status: 'untyped'}
    }
    if (inputValue[index] === words[index]) {
      return { letter: item, status: 'correct' }
    }
    return { letter: item, status: 'incorrect' }
  });

  const statusCssMap = {
    correct: 'text-green-500',
    incorrect: 'text-red-500',
    untyped: 'text-gray-500'
  }

  return (
    <div>
      <div>
        <p className='absolute text-blue'>{letters.map((item: string, index) => (
          <span key={index} className={statusCssMap[item.status]}>{item.letter}</span>
        ))}</p>
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </div>
    </div>
  )
}