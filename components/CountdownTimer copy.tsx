"use client";

import { useEffect, useRef, useState } from "react";

export default function Timer() {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* -------------------------
   * タイマー処理
   * ------------------------- */
  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      setIsRunning(false);

      // 音
      audioRef.current?.play();

      // ポップアップ
      alert("タイマー終了！");

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  /* -------------------------
   * 時間設定
   * ------------------------- */
  const handleSetTime = () => {
    const totalSeconds = minutes * 60 + seconds;

    setTimeLeft(totalSeconds);
    setIsRunning(false);
  };

  /* -------------------------
   * 開始
   * ------------------------- */
  const handleStart = () => {
    if (timeLeft <= 0) return;

    setIsRunning(true);
  };

  /* -------------------------
   * 停止
   * ------------------------- */
  const handleStop = () => {
    setIsRunning(false);
  };

  /* -------------------------
   * リセット
   * ------------------------- */
  const handleReset = () => {
    const totalSeconds = minutes * 60 + seconds;

    setTimeLeft(totalSeconds);
    setIsRunning(false);
  };

  /* -------------------------
   * 表示用
   * ------------------------- */
  const displayMinutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");

  const displaySeconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex w-[300px] flex-col items-center gap-4 rounded border p-4">
      {/* 設定 */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-20 rounded border p-1 text-center"
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="w-20 rounded border p-1 text-center"
        />
      </div>

      {/* タイマー表示 */}
      <div className="text-5xl font-bold">
        {displayMinutes}:{displaySeconds}
      </div>

      {/* ボタン */}
      <div className="flex gap-2">
        <button
          onClick={handleSetTime}
          className="rounded bg-gray-500 px-3 py-1 text-white"
        >
          設定
        </button>

        <button
          onClick={handleStart}
          className="rounded bg-green-500 px-3 py-1 text-white"
        >
          開始
        </button>

        <button
          onClick={handleStop}
          className="rounded bg-yellow-500 px-3 py-1 text-white"
        >
          停止
        </button>

        <button
          onClick={handleReset}
          className="rounded bg-red-500 px-3 py-1 text-white"
        >
          リセット
        </button>
      </div>

      {/* 音 */}
      <audio ref={audioRef} src="/sounds/alarm.mp3" preload="auto" />
    </div>
  );
}
