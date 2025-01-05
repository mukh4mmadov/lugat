import React, { useState, useEffect } from "react";

function Words() {
  const [english, setEnglish] = useState("");
  const [uzbek, setUzbek] = useState("");
  const [words, setWords] = useState([]);


  useEffect(() => {
    const storedWords = JSON.parse(localStorage.getItem("words"));
    if (storedWords) {
      setWords(storedWords);
    }
  }, []);


  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem("words", JSON.stringify(words));
    }
  }, [words]);

  const handleAddWord = () => {
    if (english && uzbek) {
      const newWord = { english, uzbek };
      setWords([...words, newWord]);
      setEnglish("");
      setUzbek("");
    }
  };

  return (
    <div className="max-w-2xl w-full p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Lugat Yaratish</h1>
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Inglizcha so‘z"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="O‘zbekcha so‘z"
          value={uzbek}
          onChange={(e) => setUzbek(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddWord}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Qo‘shish
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Lugat</h2>
        <ul className="space-y-2">
          {words.map((word, index) => (
            <li
              key={index}
              className="p-3 bg-gray-100 rounded flex justify-between"
            >
              <span>{word.english}</span> <span>{word.uzbek}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Words;
