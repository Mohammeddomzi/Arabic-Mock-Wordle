"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, RotateCcw, Trophy } from "lucide-react";
import { getWordOfTheDay, allWords } from "@/lib/words";

const ArabicWordle = () => {
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'won', 'lost'
  const [message, setMessage] = useState("");

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const wordOfTheDay = getWordOfTheDay();
    setTargetWord(wordOfTheDay);
    setCurrentGuess("");
    setGuesses([]);
    setCurrentRow(0);
    setGameStatus("playing");
    setMessage("");
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  const isArabicChar = (char) => {
    return /[\u0600-\u06FF]/.test(char);
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5) {
      setMessage("يجب أن تكون الكلمة من 5 أحرف");
      return;
    }

    if (!allWords.includes(currentGuess)) {
      setMessage("كلمة غير صحيحة");
      return;
    }

    const newGuesses = [...guesses, currentGuess] as string[];
    setGuesses(newGuesses);
    setCurrentGuess("");
    setMessage("");

    if (currentGuess === targetWord) {
      setGameStatus("won");
      setMessage("أحسنت! لقد فزت!");
    } else if (newGuesses.length >= 6) {
      setGameStatus("lost");
      setMessage(`انتهت المحاولات. الكلمة الصحيحة: ${targetWord}`);
    } else {
      setCurrentRow(currentRow + 1);
    }
  };

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (key) => {
      if (gameStatus !== "playing") return;

      if (key === "Enter") {
        submitGuess();
      } else if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else {
        // Handle both Arabic and English keyboard input
        let arabicChar = "";
        if (isArabicChar(key)) {
          arabicChar = key;
        } else if (
          englishToArabicMap[
            key.toLowerCase() as keyof typeof englishToArabicMap
          ]
        ) {
          arabicChar =
            englishToArabicMap[
              key.toLowerCase() as keyof typeof englishToArabicMap
            ];
        }

        if (arabicChar && currentGuess.length < 5) {
          setCurrentGuess((prev) => prev + arabicChar);
        }
      }
    },
    [currentGuess, gameStatus, submitGuess]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const getLetterStatus = (letter, position, word) => {
    if (!word) return "";

    const targetArray = targetWord.split("");
    const wordArray = word.split("");

    if (wordArray[position] === targetArray[position]) {
      return "correct";
    } else if (targetArray.includes(wordArray[position])) {
      return "present";
    } else {
      return "absent";
    }
  };

  // Arabic keyboard layout (RTL corrected)
  const arabicKeys = [
    ["د", "ج", "ح", "خ", "ه", "ع", "غ", "ف", "ق", "ث", "ص", "ض", "ذ"],
    ["ط", "ك", "م", "ن", "ت", "ا", "ل", "ب", "ي", "س", "ش"],
    ["ظ", "ز", "و", "ة", "ى", "لا", "ر", "ؤ", "ء", "ئ"],
  ];

  const renderGrid = () => {
    const grid = [];

    for (let i = 0; i < 6; i++) {
      const row = [];
      const currentWord =
        i < guesses.length ? guesses[i] : i === currentRow ? currentGuess : "";

      for (let j = 0; j < 5; j++) {
        const letter = currentWord[j] || "";
        const status =
          i < guesses.length ? getLetterStatus(letter, j, currentWord) : "";

        row.push(
          <div
            key={j}
            className={`w-14 h-14 border-2 flex items-center justify-center text-xl font-bold transition-colors ${
              status === "correct"
                ? "bg-green-500 text-white border-green-500"
                : status === "present"
                ? "bg-yellow-500 text-white border-yellow-500"
                : status === "absent"
                ? `${isDarkMode ? "bg-gray-700" : "bg-gray-500"} text-white ${
                    isDarkMode ? "border-gray-700" : "border-gray-500"
                  }`
                : letter
                ? `${
                    isDarkMode
                      ? "border-gray-500 bg-gray-800 text-white"
                      : "border-gray-400 bg-white text-gray-900"
                  }`
                : `${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`
            }`}
          >
            {letter}
          </div>
        );
      }

      grid.push(
        <div key={i} className="flex gap-2 justify-center">
          {row}
        </div>
      );
    }

    return grid;
  };

  const renderKeyboard = () => {
    return (
      <div className="flex flex-col gap-2 items-center mt-8">
        {arabicKeys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {rowIndex === 2 && (
              <button
                onClick={() => handleKeyPress("Enter")}
                className={`px-4 py-3 rounded text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                }`}
                disabled={gameStatus !== "playing"}
              >
                إدخال
              </button>
            )}
            {row.map((key) => {
              // Get key status based on guesses
              let keyStatus = "";
              for (const guess of guesses) {
                if (guess.includes(key)) {
                  const positions = guess
                    .split("")
                    .map((char, idx) => ({ char, idx }))
                    .filter((item) => item.char === key);

                  for (const pos of positions) {
                    const status = getLetterStatus(key, pos.idx, guess);
                    if (status === "correct") {
                      keyStatus = "correct";
                      break;
                    } else if (
                      status === "present" &&
                      keyStatus !== "correct"
                    ) {
                      keyStatus = "present";
                    } else if (status === "absent" && !keyStatus) {
                      keyStatus = "absent";
                    }
                  }
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`px-3 py-3 rounded text-sm font-semibold min-w-[40px] transition-colors
                    ${
                      keyStatus === "correct"
                        ? "bg-green-500 text-white"
                        : keyStatus === "present"
                        ? "bg-yellow-500 text-white"
                        : keyStatus === "absent"
                        ? `${
                            isDarkMode ? "bg-gray-700" : "bg-gray-500"
                          } text-white`
                        : `${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          }`
                    }`}
                  disabled={gameStatus !== "playing"}
                >
                  {key}
                </button>
              );
            })}
            {rowIndex === 2 && (
              <button
                onClick={() => handleKeyPress("Backspace")}
                className={`px-4 py-3 rounded text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                }`}
                disabled={gameStatus !== "playing"}
              >
                حذف
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center py-8 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      dir="rtl"
    >
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1
            className={`text-4xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            وردل عربي
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label={
              isDarkMode ? "تبديل إلى الوضع الفاتح" : "تبديل إلى الوضع المظلم"
            }
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          خمن الكلمة المكونة من 5 أحرف
        </p>
        <p
          className={`text-sm mt-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          كلمة اليوم
        </p>
      </header>

      <main className="flex flex-col items-center max-w-md mx-auto">
        {/* Game Grid */}
        <div className="flex flex-col gap-2 mb-6">{renderGrid()}</div>

        {/* Message Display */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm font-medium transition-colors
            ${
              gameStatus === "won"
                ? `${
                    isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-800"
                  }`
                : gameStatus === "lost"
                ? `${
                    isDarkMode
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-800"
                  }`
                : `${
                    isDarkMode
                      ? "bg-yellow-900 text-yellow-200"
                      : "bg-yellow-100 text-yellow-800"
                  }`
            }`}
          >
            {gameStatus === "won" ? (
              <Trophy className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message}
          </div>
        )}

        {/* Game Controls */}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <button
            onClick={resetGame}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold mb-6 transition-colors ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            لعب مرة أخرى
          </button>
        )}

        {/* Virtual Keyboard */}
        {renderKeyboard()}
      </main>

      {/* Instructions */}
      <footer className="mt-12 max-w-lg text-center text-sm">
        <div
          className={`p-4 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-gray-200"
              : "bg-gray-50 text-gray-600"
          }`}
        >
          <h3 className="font-semibold mb-2">كيفية اللعب:</h3>
          <div className="text-right space-y-1">
            <p>• خمن الكلمة المكونة من 5 أحرف في 6 محاولات</p>
            <p>• يمكنك استخدام لوحة المفاتيح الإنجليزية أو العربية</p>
            <p>
              •{" "}
              <span className="bg-green-500 text-white px-2 py-1 rounded">
                أخضر
              </span>{" "}
              = الحرف صحيح وفي المكان الصحيح
            </p>
            <p>
              •{" "}
              <span className="bg-yellow-500 text-white px-2 py-1 rounded">
                أصفر
              </span>{" "}
              = الحرف صحيح لكن في مكان خاطئ
            </p>
            <p>
              •{" "}
              <span
                className={`px-2 py-1 rounded text-white ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-500"
                }`}
              >
                رمادي
              </span>{" "}
              = الحرف غير موجود في الكلمة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArabicWordle;
