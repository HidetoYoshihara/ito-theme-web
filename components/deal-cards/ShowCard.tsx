"use client";

import { getItoRoomCard } from "@/lib/itoRoom";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LookupPage() {
  const router = useRouter();

  const [roomId, setRoomId] = useState("");
  //   const [lookupPlayerId, setLookupPlayerId] = useState(0);
  const [lookupPlayerId, setLookupPlayerId] = useState<number | null>(null);

  const [lookupCardNumber, setLookupCardNumber] = useState<number | null>(null);
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [lookupError, setLookupError] = useState<string>("");

  const handleBack = () => {
    if (confirm("元の画面に戻りますか？")) {
      router.back();
    }
  };

  const handleLookupCard = async () => {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      setLookupError("部屋番号を入力してください。");
      return;
    }

    setLookupStatus("loading");
    setLookupError("");

    try {
      if (lookupPlayerId === null) {
        setLookupError("プレイヤーIDを選択してください。");
        return;
      }

      const cardNumber = await getItoRoomCard(normalizedRoomId, lookupPlayerId);

      if (cardNumber === null) {
        setLookupError(
          "カードが見つかりません。部屋番号とプレイヤーIDを確認してください。",
        );
        // エラー時だけカードを消す
        setLookupCardNumber(null);
      } else {
        setLookupCardNumber(cardNumber);
      }
    } catch (error) {
      setLookupError(
        error instanceof Error
          ? error.message
          : "カードの取得に失敗しました。設定と通信状態を確認してください。",
      );
      setLookupCardNumber(null);
    } finally {
      setLookupStatus("idle");
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center px-4 py-4">
      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-md backdrop-blur-md active:scale-95"
      >
        ←
      </button>

      {/* カード表示（消えない） */}
      <div className="relative mt-2 flex h-[48vh] w-[68vw] items-center justify-center rounded-2xl border-2 border-amber-200 bg-white text-[72px] font-black text-slate-900 shadow-xl">
        {/* カード番号 */}
        {lookupCardNumber !== null ? lookupCardNumber : "?"}

        {/* ローディングオーバーレイ（任意） */}
        {lookupStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 text-2xl font-bold text-slate-700">
            読み込み中…
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <div className="mt-12 flex w-full flex-col gap-4">
        <p className="text-center text-xs leading-relaxed text-white/60">
          配布時に設定した部屋番号とプレイヤーIDを入力してください。
        </p>

        {/* 横並び入力欄 */}
        <div className="flex w-full gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm text-white/70">部屋</span>
            <input
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setLookupError("");
              }}
              className="rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-base text-white/80 outline-none placeholder:text-white/40"
              placeholder="例: 101"
            />
          </div>

          <div className="flex w-24 flex-col gap-1">
            <span className="text-sm text-white/70">ID</span>
            <select
              value={lookupPlayerId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setLookupPlayerId(v === "" ? null : Number(v));
                setLookupError("");
              }}
              className={`rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-base outline-none ${lookupPlayerId === null ? "text-white/40" : "text-white/80"} `}
            >
              <option value="">選択</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
                <option
                  key={id}
                  value={id}
                >
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-[#f8d59d] px-6 py-3 text-lg font-bold text-slate-900 shadow-md transition hover:bg-[#f2c770] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          onClick={handleLookupCard}
          disabled={lookupStatus === "loading"}
        >
          {lookupStatus === "loading" ? "確認中..." : "カードを確認"}
        </button>

        {/* エラー（高さ固定） */}
        <div className="min-h-[20px]">
          {lookupError && (
            <p
              className="text-center text-sm text-rose-300"
              role="alert"
            >
              {lookupError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
