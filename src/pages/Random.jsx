import React, { useState, useEffect } from "react";

function Random() {
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isEnglish, setIsEnglish] = useState(true);
  const [words, setWords] = useState([]);

  // Sahifa yuklanganda localStorage'dan so'zlarni olish
  useEffect(() => {
    const storedWords = JSON.parse(localStorage.getItem("words"));
    if (storedWords) {
      setWords(storedWords);
    }
  }, []);

  const handleNext = () => {
    // Keyingi so'zni ko'rsatish
    if (words.length > 0) {
      setIndex((prev) => (prev + 1) % words.length);
      setShowTranslation(false);
      setIsEnglish(Math.random() > 0.5);
    }
  };

  return (
    <div className="max-w-xl w-full p-6 bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-2xl font-bold mb-6">So‘zlarni Yodlash</h1>

      {/* Lugat bo'sh bo'lsa, "Lugat bosh" ko'rsatiladi */}
      {words.length === 0 ? (
        <div className="text-xl text-red-500">Lugat bosh</div>
      ) : (
        <div>
          <div className="text-3xl font-semibold mb-4">
            {isEnglish ? words[index].english : words[index].uzbek}
          </div>

          {showTranslation && (
            <div className="text-xl text-gray-700">
              {isEnglish ? words[index].uzbek : words[index].english}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setShowTranslation(true)}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Ko‘rish
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Random;