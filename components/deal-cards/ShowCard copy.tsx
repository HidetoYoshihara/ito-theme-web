"use client";

import { useState } from "react";
import { getItoRoomCard, saveItoRoomCards } from "@/lib/itoRoom";

type ShowCardProps = {};

export default function LookupPage({}: ShowCardProps) {
  const [roomId, setRoomId] = useState("");
  const [lookupPlayerId, setLookupPlayerId] = useState(1);

  const [lookupCardNumber, setLookupCardNumber] = useState<number | null>(null);
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [lookupError, setLookupError] = useState<string>("");

  const handleLookupCard = async () => {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      setLookupError("部屋番号を入力してください。");
      setLookupCardNumber(null);
      return;
    }

    setLookupStatus("loading");
    setLookupError("");
    setLookupCardNumber(null);
    try {
      const cardNumber = await getItoRoomCard(normalizedRoomId, lookupPlayerId);
      if (cardNumber === null) {
        setLookupError(
          "カードが見つかりません。部屋番号とプレイヤーIDを確認してください。",
        );
      } else {
        setLookupCardNumber(cardNumber);
      }
    } catch (error) {
      setLookupError(
        error instanceof Error
          ? error.message
          : "カードの取得に失敗しました。設定と通信状態を確認してください。",
      );
    } finally {
      setLookupStatus("idle");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 px-4 py-6">
      {/* 説明文 */}
      <p className="text-center text-base leading-relaxed text-white/80">
        配布時に設定した部屋番号と
        <br />
        プレイヤーIDを入力してください。
      </p>

      {/* 部屋番号 */}
      <label className="flex w-full flex-col gap-2 text-base text-white/80">
        <span className="font-medium">部屋番号</span>
        <input
          value={roomId}
          onChange={(event) => {
            setRoomId(event.target.value);
            setLookupCardNumber(null);
            setLookupError("");
          }}
          className="rounded-lg border border-white/20 bg-slate-800 px-4 py-3 text-lg text-white outline-none placeholder:text-white/40"
          placeholder="例: A12"
        />
      </label>

      {/* プレイヤーID */}
      <label className="flex w-full flex-col gap-2 text-base text-white/80">
        <span className="font-medium">プレイヤーID</span>
        <select
          value={lookupPlayerId}
          onChange={(event) => {
            setLookupPlayerId(Number(event.target.value));
            setLookupCardNumber(null);
            setLookupError("");
          }}
          className="rounded-lg border border-white/20 bg-slate-800 px-4 py-3 text-lg text-white outline-none"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map(
            (playerId) => (
              <option key={playerId} value={playerId}>
                {playerId}
              </option>
            ),
          )}
        </select>
      </label>

      {/* ボタン */}
      <button
        type="button"
        className="w-full rounded-xl bg-[#f8d59d] px-6 py-3 text-lg font-bold text-slate-900 shadow-md transition hover:bg-[#f2c770] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        onClick={handleLookupCard}
        disabled={lookupStatus === "loading"}
      >
        {lookupStatus === "loading" ? "確認中..." : "カードを確認"}
      </button>

      {/* エラー */}
      {lookupError && (
        <p className="text-center text-sm text-rose-300" role="alert">
          {lookupError}
        </p>
      )}

      {/* カード表示（モバイル最適化） */}
      {lookupCardNumber !== null && (
        <div
          className="mt-4 flex h-48 w-32 items-center justify-center rounded-2xl border-2 border-amber-200 bg-white text-6xl font-black text-slate-900 shadow-xl max-sm:h-64 max-sm:w-40 max-sm:text-7xl"
          role="status"
        >
          {lookupCardNumber}
        </div>
      )}
    </section>
  );
}
