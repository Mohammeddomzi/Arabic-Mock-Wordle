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

  const isArabicChar = (char: string) => {
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
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses as never[]);
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
    (key: string) => {
      if (gameStatus !== "playing") return;

      if (key === "Enter") {
        submitGuess();
      } else if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else {
        let arabicChar = "";
        if (isArabicChar(key)) {
          arabicChar = key;
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

  const getLetterStatus = (letter: string, position: number, word: string) => {
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
    ["ج", "ح", "خ", "ه", "ع", "غ", "ف", "ق", "ث", "ص", "ض"],
    ["ة", "ك", "م", "ن", "ت", "ا", "ل", "ب", "ي", "س", "ش"],
    ["ى", "و", "ر", "ز", "د", "ذ", "ط", "ظ", "ء"],
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
            className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-200 ${
              status === "correct"
                ? "bg-green-500 text-white border-green-500 animate-pulse"
                : status === "present"
                ? "bg-yellow-500 text-white border-yellow-500 animate-pulse"
                : status === "absent"
                ? `${isDarkMode ? "bg-gray-700" : "bg-gray-500"} text-white ${
                    isDarkMode ? "border-gray-700" : "border-gray-500"
                  }`
                : letter
                ? `${
                    isDarkMode
                      ? "border-gray-500 bg-gray-800 text-white"
                      : "border-gray-400 bg-white text-gray-900"
                  } scale-105`
                : `${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`
            } rounded-md`}
          >
            {letter}
          </div>
        );
      }

      grid.push(
        <div key={i} className="flex gap-1 sm:gap-2 justify-center">
          {row}
        </div>
      );
    }

    return grid;
  };

  const renderKeyboard = () => {
    return (
      <div className="flex flex-col gap-1 items-center mt-6 px-1 w-full">
        {arabicKeys.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-0.5 sm:gap-1 justify-center w-full max-w-xs sm:max-w-lg"
          >
            {rowIndex === 0 && (
              <button
                onClick={() => handleKeyPress("Enter")}
                className={`px-1.5 sm:px-3 py-2 sm:py-3 rounded text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white active:bg-gray-400"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900 active:bg-gray-500"
                } touch-manipulation`}
                disabled={gameStatus !== "playing"}
              >
                إدخال
              </button>
            )}
            {row.map((key) => {
              let keyStatus = "";
              for (const guess of guesses) {
                if (typeof guess === "string") {
                  const positions = Array.from(guess)
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
                  className={`px-1.5 sm:px-3 py-2 sm:py-3 rounded text-sm sm:text-base font-semibold min-w-[28px] sm:min-w-[40px] flex-1 max-w-[36px] sm:max-w-[50px] transition-all duration-200 active:scale-95 touch-manipulation
                    ${
                      keyStatus === "correct"
                        ? "bg-green-500 text-white shadow-lg"
                        : keyStatus === "present"
                        ? "bg-yellow-500 text-white shadow-lg"
                        : keyStatus === "absent"
                        ? `${
                            isDarkMode ? "bg-gray-700" : "bg-gray-500"
                          } text-white`
                        : `${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white active:bg-gray-500"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-900 active:bg-gray-400"
                          } shadow-sm`
                    }`}
                  disabled={gameStatus !== "playing"}
                >
                  {key}
                </button>
              );
            })}
            {rowIndex === arabicKeys.length - 1 && (
              <button
                onClick={() => handleKeyPress("Backspace")}
                className={`px-1.5 sm:px-3 py-2 sm:py-3 rounded text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white active:bg-gray-400"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900 active:bg-gray-500"
                } touch-manipulation`}
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
      className={`min-h-screen flex flex-col items-center py-4 sm:py-8 px-4 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <header className="text-center mb-4 sm:mb-8 w-full">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <h1
            className={`text-2xl sm:text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            وردل عربي
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-400 active:bg-gray-500"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 active:bg-gray-400"
            } touch-manipulation`}
            aria-label={
              isDarkMode ? "تبديل إلى الوضع الفاتح" : "تبديل إلى الوضع المظلم"
            }
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <p
          className={`text-sm sm:text-base ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          خمن الكلمة المكونة من 5 أحرف
        </p>
        <p
          className={`text-xs sm:text-sm mt-1 sm:mt-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          كلمة اليوم
        </p>
      </header>

      {/* Main Game Area */}
      <main className="flex flex-col items-center w-full max-w-sm sm:max-w-md mx-auto">
        {/* Game Grid */}
        <div className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6">
          {renderGrid()}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm font-medium transition-all duration-300 w-full max-w-xs text-center justify-center
            ${
              gameStatus === "won"
                ? `${
                    isDarkMode
                      ? "bg-green-900 text-green-200 border border-green-700"
                      : "bg-green-100 text-green-800 border border-green-300"
                  }`
                : gameStatus === "lost"
                ? `${
                    isDarkMode
                      ? "bg-red-900 text-red-200 border border-red-700"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`
                : `${
                    isDarkMode
                      ? "bg-yellow-900 text-yellow-200 border border-yellow-700"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`
            }`}
          >
            {gameStatus === "won" ? (
              <Trophy className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="flex-1">{message}</span>
          </div>
        )}

        {/* Game Controls */}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <button
            onClick={resetGame}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold mb-6 transition-all duration-200 active:scale-95 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white active:bg-blue-800"
                : "bg-blue-500 hover:bg-blue-600 text-white active:bg-blue-700"
            } shadow-lg touch-manipulation`}
          >
            <RotateCcw className="w-4 h-4" />
            لعب مرة أخرى
          </button>
        )}

        {/* Virtual Keyboard */}
        {renderKeyboard()}
      </main>

      {/* Instructions */}
      <footer className="mt-8 sm:mt-12 max-w-xs sm:max-w-lg text-center text-xs sm:text-sm px-4">
        <div
          className={`p-3 sm:p-4 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-gray-200 border border-gray-700"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}
        >
          <h3 className="font-semibold mb-2">كيفية اللعب:</h3>
          <div className="text-right space-y-1 text-xs sm:text-sm">
            <p>• خمن الكلمة المكونة من 5 أحرف في 6 محاولات</p>
            <p>• استخدم لوحة المفاتيح أو اللمس</p>
            <p>
              •{" "}
              <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                أخضر
              </span>{" "}
              = الحرف صحيح وفي المكان الصحيح
            </p>
            <p>
              •{" "}
              <span className="bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                أصفر
              </span>{" "}
              = الحرف صحيح لكن في مكان خاطئ
            </p>
            <p>
              •{" "}
              <span
                className={`px-1 py-0.5 rounded text-white text-xs ${
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
