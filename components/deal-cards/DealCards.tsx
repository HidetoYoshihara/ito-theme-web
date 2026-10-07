"use client";

import { useEffect, useRef, useState } from "react";

type DealPlayer = {
  value: number;
  revealed: boolean;
  judgeOrder?: number;
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
  mode,
  onModeChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "deal" | "judge";
  onModeChange: (mode: "deal" | "judge") => void;
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
  const [judgeStatus, setJudgeStatus] = useState<
    "idle" | "revealing" | "complete"
  >("idle");
  const [judgeRevealedCount, setJudgeRevealedCount] = useState(0);
  const [judgeResults, setJudgeResults] = useState<Record<number, boolean>>({});
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

  const resetJudge = () => {
    setJudgeStatus("idle");
    setJudgeRevealedCount(0);
    setJudgeResults({});
    setDealPlayers((current) =>
      current.map((player) => ({ ...player, judgeOrder: undefined })),
    );
  };

  const handleModeChange = (nextMode: "deal" | "judge") => {
    resetJudge();
    setPendingRevealIndex(null);
    setDealPlayers((current) =>
      current.map((player) => ({ ...player, revealed: false })),
    );
    onModeChange(nextMode);
  };

  const handleDealPlayers = () => {
    const values = shuffleNumbers(dealPlayerCount);
    const players = Array.from({ length: dealPlayerCount }, (_, index) => ({
      value: values[index],
      revealed: false,
    }));

    setDealPlayers(players);
    setJudgeStatus("idle");
    setJudgeRevealedCount(0);
    setJudgeResults({});
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
    if (mode === "judge") {
      if (judgeStatus !== "idle") return;
      setDealPlayers((current) => {
        const selectedPlayer = current[index];
        if (!selectedPlayer) return current;

        if (selectedPlayer.judgeOrder !== undefined) {
          const orderByIndex = new Map(
            current
              .map((player, playerIndex) => ({ player, playerIndex }))
              .filter(
                ({ player, playerIndex }) =>
                  playerIndex !== index && player.judgeOrder !== undefined,
              )
              .sort(
                (left, right) =>
                  left.player.judgeOrder! - right.player.judgeOrder!,
              )
              .map(({ playerIndex }, orderIndex) => [
                playerIndex,
                orderIndex + 1,
              ]),
          );
          return current.map((player, playerIndex) => ({
            ...player,
            judgeOrder: orderByIndex.get(playerIndex),
          }));
        }

        const nextOrder =
          current.filter((player) => player.judgeOrder !== undefined).length +
          1;
        return current.map((player, playerIndex) =>
          playerIndex === index ? { ...player, judgeOrder: nextOrder } : player,
        );
      });
      return;
    }

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
  const orderedJudgePlayers = dealPlayers
    .map((player, index) => ({ player, index }))
    .filter(
      (
        entry,
      ): entry is {
        player: DealPlayer & { judgeOrder: number };
        index: number;
      } => entry.player.judgeOrder !== undefined,
    )
    .sort((left, right) => left.player.judgeOrder - right.player.judgeOrder);

  useEffect(() => {
    if (judgeStatus !== "revealing") return;
    const orderedPlayers = dealPlayers
      .map((player, index) => ({ player, index }))
      .filter(
        (
          entry,
        ): entry is {
          player: DealPlayer & { judgeOrder: number };
          index: number;
        } => entry.player.judgeOrder !== undefined,
      )
      .sort((left, right) => left.player.judgeOrder - right.player.judgeOrder);

    if (judgeRevealedCount >= orderedPlayers.length) return;

    const current = orderedPlayers[judgeRevealedCount];
    const previous = orderedPlayers[judgeRevealedCount - 1];
    const isCorrect = !previous || current.player.value < previous.player.value;
    const timeout = setTimeout(() => {
      setJudgeResults((results) => ({
        ...results,
        [current.index]: isCorrect,
      }));
      setJudgeRevealedCount(judgeRevealedCount + 1);
      if (judgeRevealedCount + 1 >= orderedPlayers.length) {
        setJudgeStatus("complete");
      }
    }, 1000 + judgeRevealedCount * 200);

    return () => clearTimeout(timeout);
  }, [dealPlayers, judgeRevealedCount, judgeStatus]);

  const judgeSucceeded =
    judgeStatus === "complete" &&
    Object.keys(judgeResults).length === dealPlayers.length &&
    Object.values(judgeResults).every(Boolean);
  const revealedPlayerIndex = dealPlayers.findIndex(
    (player) => player.revealed,
  );

  if (!isOpen) return null;

  return (
    <div className="absolute top-[20%] left-1/2 z-40 min-h-[min(360px,calc(100%-1rem))] w-[min(1080px,calc(100%-1rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1f2937]/90 p-4 pb-6 text-white shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-[#f8d59d]">
          {mode === "judge" ? "ジャッジモード" : "デジタルカード"}
        </div>
        <button
          type="button"
          className="text-sm text-white/70 hover:text-white"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            mode === "deal"
              ? "bg-[#f8d59d] text-slate-900"
              : "border border-white/20 bg-slate-800 text-white/75 hover:text-white"
          }`}
          onClick={() => handleModeChange("deal")}
          aria-pressed={mode === "deal"}
        >
          カード配布
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            mode === "judge"
              ? "bg-[#f8d59d] text-slate-900"
              : "border border-white/20 bg-slate-800 text-white/75 hover:text-white"
          }`}
          onClick={() => handleModeChange("judge")}
          aria-pressed={mode === "judge"}
        >
          ジャッジ
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
        {mode === "deal" && revealedPlayerIndex !== -1 && (
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
          {mode === "judge" && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
              <p className="text-sm text-white/80">
                {judgeStatus === "idle"
                  ? `数字が大きいカードから順番に選択してください（${orderedJudgePlayers.length}/${dealPlayers.length}）`
                  : judgeStatus === "revealing"
                    ? "選んだ順番にカードをめくっています..."
                    : judgeSucceeded
                      ? "すべて正しい順番です！"
                      : "数字の順番が違います。"}
              </p>
              <button
                type="button"
                className="rounded-md bg-[#f8d59d] px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-[#f2c770] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={
                  judgeStatus !== "idle" ||
                  orderedJudgePlayers.length !== dealPlayers.length
                }
                onClick={() => {
                  setJudgeResults({});
                  setJudgeRevealedCount(0);
                  setJudgeStatus("revealing");
                }}
              >
                決定
              </button>
            </div>
          )}
          <div
            className={`flex w-full justify-center ${
              mode === "judge" || dealPlayers.length > 6
                ? "flex-nowrap gap-3 overflow-x-auto pb-2"
                : "flex-wrap gap-4"
            }`}
          >
            {dealPlayers.map((player, index) => {
              const cardSizeClass =
                mode !== "judge" && dealPlayers.length <= 6
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
                  <div className="relative">
                    {mode === "judge" &&
                      player.judgeOrder !== undefined &&
                      judgeStatus === "idle" && (
                        <span className="absolute -top-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-red-200 bg-red-600 text-sm font-black text-white shadow-lg">
                          {player.judgeOrder}
                        </span>
                      )}
                    <button
                      type="button"
                      onClick={() => handleCardClick(index)}
                      disabled={
                        mode === "judge"
                          ? judgeStatus !== "idle"
                          : revealedPlayerIndex !== -1 &&
                            revealedPlayerIndex !== index
                      }
                      className={`group relative shrink-0 rounded-xl border bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 p-1 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
                        mode === "judge" && player.judgeOrder !== undefined
                          ? "border-red-400 opacity-70"
                          : "border-[#f8d59d]/40"
                      } ${cardSizeClass}`}
                      aria-label={
                        mode === "judge"
                          ? `P${index + 1} ${getPlayerName(index)}のカードを${player.judgeOrder === undefined ? "順番に追加" : "順番から外す"}`
                          : `P${index + 1} ${getPlayerName(index)}のカード${player.revealed ? "を閉じる" : "を開く"}`
                      }
                    >
                      {mode === "judge" &&
                      player.judgeOrder !== undefined &&
                      player.judgeOrder <= judgeRevealedCount ? (
                        <div className="judge-card-flip flex h-full flex-col items-center justify-center rounded-lg border border-amber-200/40 bg-slate-50 text-slate-900">
                          <div className="text-[9px] font-bold text-slate-500">
                            P{index + 1}
                          </div>
                          <div className="mt-1 text-3xl leading-none font-black">
                            {player.value}
                          </div>
                        </div>
                      ) : mode === "deal" && player.revealed ? (
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
                    {mode === "judge" &&
                      judgeResults[index] !== undefined &&
                      player.judgeOrder !== undefined &&
                      player.judgeOrder <= judgeRevealedCount && (
                        <span
                          className={`absolute top-1/2 -right-7 -translate-y-1/2 text-2xl font-black ${
                            judgeResults[index] ? "text-red-400" : "text-white"
                          }`}
                          aria-label={judgeResults[index] ? "成功" : "失敗"}
                        >
                          {judgeResults[index] ? "⭕" : "×"}
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          {mode === "judge" && judgeStatus === "complete" && (
            <div
              className={`judge-result-pop absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/35 ${
                judgeSucceeded ? "text-emerald-300" : "text-rose-300"
              }`}
              role="status"
              aria-live="assertive"
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-slate-900/95 px-10 py-6 text-5xl font-black shadow-2xl">
                <span>{judgeSucceeded ? "成功！！" : "残念！"}</span>
                <button
                  type="button"
                  className="rounded-md bg-[#f8d59d] px-4 py-2 text-base font-bold text-slate-900 transition hover:bg-[#f2c770]"
                  onClick={resetJudge}
                >
                  戻る
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-white/20 bg-slate-800/40 px-3 py-4 text-sm text-white/70">
          {mode === "judge"
            ? "ジャッジするカードはまだ配られていません。"
            : "カードはまだ配られていません。"}
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
