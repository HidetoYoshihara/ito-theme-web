"use client";

import { useEffect, useRef, useState } from "react";

export default function Timer() {
  const [showInfo, setShowInfo] = useState(false);
  /* -------------------------
   * 初期値
   * ------------------------- */
  const DEFAULT_MINUTE_TENS = 0;
  const DEFAULT_MINUTE_ONES = 2;

  const DEFAULT_SECOND_TENS = 0;
  const DEFAULT_SECOND_ONES = 0;

  const DEFAULT_TIME_LEFT = 120;

  /* -------------------------
   * 設定値
   * ------------------------- */
  const [minuteTens, setMinuteTens] = useState(DEFAULT_MINUTE_TENS);

  const [minuteOnes, setMinuteOnes] = useState(DEFAULT_MINUTE_ONES);

  const [secondTens, setSecondTens] = useState(DEFAULT_SECOND_TENS);

  const [secondOnes, setSecondOnes] = useState(DEFAULT_SECOND_ONES);

  /* -------------------------
   * 実際の分・秒
   * ------------------------- */
  const minutes = minuteTens * 10 + minuteOnes;

  const seconds = secondTens * 10 + secondOnes;

  /* -------------------------
   * タイマー状態
   * ------------------------- */
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LEFT);

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
   * 開始・停止切り替え
   * ------------------------- */
  const handleToggleTimer = () => {
    if (timeLeft <= 0) return;

    setIsRunning((prev) => !prev);
  };

  /* -------------------------
   * リセット
   * 現在設定値へ戻す
   * ------------------------- */
  const handleReset = () => {
    const totalSeconds = minutes * 60 + seconds;

    setTimeLeft(totalSeconds);

    setIsRunning(false);
  };

  /* -------------------------
   * クリア
   * 初期値へ戻す
   * ------------------------- */
  const handleClear = () => {
    setMinuteTens(DEFAULT_MINUTE_TENS);

    setMinuteOnes(DEFAULT_MINUTE_ONES);

    setSecondTens(DEFAULT_SECOND_TENS);

    setSecondOnes(DEFAULT_SECOND_ONES);

    setTimeLeft(DEFAULT_TIME_LEFT);

    setIsRunning(false);
  };

  /* -------------------------
   * タイマーカラー
   * ------------------------- */
  const timerColor = (() => {
    if (!isRunning) return "text-white/30";

    // FIXME: できれば0.5秒間隔の点滅にしたい。
    // if (timeLeft <= 10) return "text-red-400";
    if (timeLeft <= 10) {
      return timeLeft % 2 === 0
        ? "text-red-400 opacity-100"
        : "text-red-400 opacity-40";
    }
    if (timeLeft <= 20) return "text-red-400";
    if (timeLeft <= 40) return "text-orange-300";
    if (timeLeft <= 60) return "text-yellow-200";

    return "text-white/85";
  })();

  /* -------------------------
   * 表示用
   * ------------------------- */
  const displayMinutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");

  const displaySeconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="relative flex w-[340px] flex-col items-center gap-2 rounded border p-2">
      <button
        type="button"
        className="absolute top-2 right-2 rounded-full border border-white/20 bg-black/20 px-2 py-1 text-sm text-white/80 transition hover:bg-white/10"
        onClick={() => setShowInfo((prev) => !prev)}
        aria-expanded={showInfo}
        aria-label="タイマーの説明を表示"
      >
        ？
      </button>

      {showInfo && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 bg-transparent"
            onClick={() => setShowInfo(false)}
            aria-hidden="true"
          />
          <div className="absolute top-10 right-2 z-20 w-[300px] rounded-xl border border-white/20 bg-black/90 p-3 text-left text-xs text-white/80 shadow-lg">
            <div className="mb-2 font-semibold text-white">タイマーの用途</div>
            <p className="leading-tight">
              回答時間を管理するためのタイマーです。
              <br />
              セットして開始すると、残り時間を確認できます。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-white/75">
              <li>「設定」で時間を反映します。</li>
              <li>「開始」でカウントダウンが始まります。</li>
              <li>0になると音と通知でお知らせします。</li>
              <li>
                「リセット」は現在設定値に戻し、「クリア」は初期値に戻します。
              </li>
            </ul>
          </div>
        </>
      )}

      {/* 設定 */}
      <div className="flex items-center gap-1 text-white/80">
        {/* 分 十の位 */}
        <select
          value={minuteTens}
          onChange={(e) => setMinuteTens(Number(e.target.value))}
          className="w-12 rounded border bg-black/20 p-0.5 text-center"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        {/* 分 一の位 */}
        <select
          value={minuteOnes}
          onChange={(e) => setMinuteOnes(Number(e.target.value))}
          className="w-12 rounded border bg-black/20 p-0.5 text-center"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <span className="px-1">:</span>

        {/* 秒 十の位 */}
        <select
          value={secondTens}
          onChange={(e) => setSecondTens(Number(e.target.value))}
          className="w-12 rounded border bg-black/20 p-0.5 text-center"
        >
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        {/* 秒 一の位 */}
        <select
          value={secondOnes}
          onChange={(e) => setSecondOnes(Number(e.target.value))}
          className="w-12 rounded border bg-black/20 p-0.5 text-center"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* タイマー表示 */}
      <div
        className={`text-6xl font-bold transition-all duration-300 ${timerColor}`}
      >
        {displayMinutes}:{displaySeconds}
      </div>

      {/* ボタン */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={handleSetTime}
          className="rounded bg-gray-500/70 px-3 py-1 text-white/80 transition-all duration-100 active:scale-90"
        >
          設定
        </button>

        <button
          onClick={handleToggleTimer}
          className={`rounded px-3 py-1 text-white/80 transition-all duration-100 active:scale-90 ${isRunning ? "bg-yellow-500/70" : "bg-green-500/70"} `}
        >
          {isRunning ? "停止" : "開始"}
        </button>

        <button
          onClick={handleReset}
          className="rounded bg-red-500/70 px-3 py-1 text-white/80 transition-all duration-100 active:scale-90"
        >
          リセット
        </button>

        <button
          onClick={handleClear}
          className="rounded bg-blue-500/70 px-3 py-1 text-white/80 transition-all duration-100 active:scale-90"
        >
          クリア
        </button>
      </div>

      {/* 音 */}
      <audio ref={audioRef} src="/sounds/alarm.mp3" preload="auto" />
    </div>
  );
}
