"use client";

import { useEffect, useRef, useState } from "react";

type DealPlayer = {
  value: number;
  revealed: boolean;
};

const getDefaultPlayerNames = (count: number) =>
  Array.from({ length: count }, (_, index) => `プレイヤー${index + 1}`);

const shuffleNumbers = (count: number) => {
  const numbers = Array.from({ length: 100 }, (_, index) => index + 1);
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, count);
};

export default function DealCards({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [dealPlayerCount, setDealPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    getDefaultPlayerNames(4),
  );
  const [dealPlayers, setDealPlayers] = useState<DealPlayer[]>([]);
  const [pendingRevealIndex, setPendingRevealIndex] = useState<number | null>(
    null,
  );
  const [dealAnimationId, setDealAnimationId] = useState(0);
  const [dealStatus, setDealStatus] = useState<"idle" | "dealing">("idle");
  const dealStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(
    () => () => {
      if (dealStatusTimeoutRef.current) {
        clearTimeout(dealStatusTimeoutRef.current);
      }
    },
    [],
  );

  const getPlayerName = (index: number) =>
    playerNames[index]?.trim() || `プレイヤー${index + 1}`;

  const handleDealPlayers = () => {
    const values = shuffleNumbers(dealPlayerCount);
    const players = Array.from({ length: dealPlayerCount }, (_, index) => ({
      value: values[index],
      revealed: false,
    }));

    setDealPlayers(players);
    setPendingRevealIndex(null);
    setDealAnimationId((current) => current + 1);
    setDealStatus("dealing");

    if (dealStatusTimeoutRef.current) {
      clearTimeout(dealStatusTimeoutRef.current);
    }
    dealStatusTimeoutRef.current = setTimeout(() => {
      setDealStatus("idle");
      dealStatusTimeoutRef.current = null;
    }, 1400);
  };

  const handleCardClick = (index: number) => {
    if (dealPlayers[index]?.revealed) {
      setDealPlayers((current) =>
        current.map((card) => ({ ...card, revealed: false })),
      );
      return;
    }

    if (dealPlayers.some((card) => card.revealed)) return;
    setPendingRevealIndex(index);
  };

  const handleConfirmReveal = () => {
    if (pendingRevealIndex === null) return;

    setDealPlayers((current) =>
      current.map((card, index) => ({
        ...card,
        revealed: index === pendingRevealIndex,
      })),
    );
    setPendingRevealIndex(null);
  };

  const handleCloseRevealedCard = () => {
    setDealPlayers((current) =>
      current.map((card) => ({ ...card, revealed: false })),
    );
  };
  const revealedPlayerIndex = dealPlayers.findIndex(
    (player) => player.revealed,
  );

  if (!isOpen) return null;

  return (
    <div className="absolute top-[20%] left-1/2 z-40 min-h-[min(360px,calc(100%-1rem))] w-[min(1080px,calc(100%-1rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1f2937]/90 p-4 pb-6 text-white shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-[#f8d59d]">
          デジタルカード
        </div>
        <button
          type="button"
          className="text-sm text-white/70 hover:text-white"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <span>配る人数</span>
          <select
            value={dealPlayerCount}
            onChange={(event) => setDealPlayerCount(Number(event.target.value))}
            className="rounded border border-white/20 bg-slate-800 px-2 py-1 text-white outline-none"
            aria-label="配る人数"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map(
              (count) => (
                <option key={count} value={count}>
                  {count}人
                </option>
              ),
            )}
          </select>
        </label>
        <div className="pr-10">
          <button
            type="button"
            className="min-w-[240px] rounded-md bg-[#f8d59d] px-6 py-2 text-center text-sm font-bold text-slate-900 transition duration-200 hover:bg-[#f2c770] active:scale-[0.98]"
            onClick={handleDealPlayers}
          >
            {dealStatus === "dealing" ? "カードを配布中..." : "カードを配る"}
          </button>
        </div>
        {revealedPlayerIndex !== -1 && (
          <p className="text-2xl text-green-400">
            カードを閉じるにはカードをもう一度クリック！
          </p>
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {dealStatus === "dealing"
          ? `${dealPlayerCount}人にカードを配布中です`
          : ""}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: dealPlayerCount }, (_, index) => (
          <label
            key={`name-${index}`}
            className="flex items-center text-sm text-white/80"
          >
            <span className="w-10 shrink-0">P{index + 1}</span>
            <input
              value={playerNames[index] ?? `プレイヤー${index + 1}`}
              maxLength={12}
              onChange={(event) => {
                const nextName = event.target.value.slice(0, 12);
                setPlayerNames((current) => {
                  const updated = [...current];
                  updated[index] = nextName;
                  return updated;
                });
              }}
              className="w-full rounded border border-white/15 bg-slate-800 px-2 py-1 text-white outline-none placeholder:text-white/30"
              placeholder={`プレイヤー${index + 1}`}
            />
          </label>
        ))}
      </div>

      {dealPlayers.length > 0 ? (
        <>
          {/* {revealedPlayerIndex !== -1 && (
            <div className="mb-2 flex justify-center">
              <button
                type="button"
                className="rounded-md border border-white/25 bg-slate-700 px-3 py-2 text-sm text-white transition hover:bg-slate-600"
                onClick={handleCloseRevealedCard}
              >
                カードを閉じる
              </button>
            </div>
          )} */}
          <div
            className={`flex w-full justify-center ${dealPlayers.length > 6 ? "flex-nowrap gap-3 overflow-x-auto pb-2" : "flex-wrap gap-4"}`}
          >
            {dealPlayers.map((player, index) => {
              const cardSizeClass =
                dealPlayers.length <= 6
                  ? "h-28 w-22 xl:h-32 xl:w-26"
                  : "h-24 w-18 xl:h-28 xl:w-22";

              const captionSizeClass =
                dealPlayers.length > 6
                  ? "max-w-20 xl:max-w-24"
                  : "max-w-24 xl:max-w-28";

              return (
                <div
                  key={`${dealAnimationId}-${index}`}
                  className="deal-card-enter flex shrink-0 flex-col items-center"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div
                    className={`mb-1 w-full truncate text-center text-xs text-white/90 ${captionSizeClass}`}
                    title={`(P${index + 1}) ${getPlayerName(index)}`}
                  >
                    {getPlayerName(index)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCardClick(index)}
                    disabled={
                      revealedPlayerIndex !== -1 &&
                      revealedPlayerIndex !== index
                    }
                    className={`group relative shrink-0 rounded-xl border border-[#f8d59d]/40 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 p-1 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${cardSizeClass}`}
                    aria-label={`P${index + 1} ${getPlayerName(index)}のカード${player.revealed ? "を閉じる" : "を開く"}`}
                  >
                    {player.revealed ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-amber-200/40 bg-slate-50 text-slate-900">
                        <div className="mt-1 text-3xl leading-none font-black">
                          {player.value}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-[#f8d59d]/40 bg-[radial-gradient(circle_at_top,_rgba(248,213,157,0.35),_rgba(15,23,42,0.95)_55%)]">
                        <div className="mb-1 h-8 w-8 rounded-full border border-[#f8d59d]/40 bg-slate-900/60" />
                        <div className="text-[9px] font-bold tracking-[0.2em] text-[#f8d59d]">
                          CARD
                        </div>
                        <span className="text-xs text-gray-400">
                          P{index + 1}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-white/20 bg-slate-800/40 px-3 py-4 text-sm text-white/70">
          カードはまだ配られていません。
        </div>
      )}

      {pendingRevealIndex !== null && dealPlayers[pendingRevealIndex] && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-card-player-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-white/15 bg-slate-800 p-5 text-center shadow-2xl">
            <p
              id="confirm-card-player-title"
              className="mb-5 text-lg font-medium text-white"
            >
              <span className="pr-2 text-xl">
                {getPlayerName(pendingRevealIndex)}
              </span>
              のカードですか？
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="rounded-md bg-slate-600 px-4 py-2 text-sm text-white transition hover:bg-slate-500"
                onClick={() => setPendingRevealIndex(null)}
              >
                戻る
              </button>
              <button
                type="button"
                className="rounded-md bg-[#f8d59d] px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-[#f2c770]"
                onClick={handleConfirmReveal}
              >
                カードを開く
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
