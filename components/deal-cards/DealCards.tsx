"use client";

import { useEffect, useRef, useState } from "react";
import { getItoRoomCard, saveItoRoomCards } from "@/lib/itoRoom";

const BASE_JUDGE_REVEAL_INTERVAL = 1000;
const JUDGE_REVEAL_INTERVAL_STEP = 200;

type DealPlayer = {
  value: number;
  revealed: boolean;
  judgeOrder?: number;
  judgeRevealOrder?: number;
};

const confettiColors = ["#f97316", "#facc15", "#34d399", "#60a5fa", "#f472b6"];

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
  const [activeTab, setActiveTab] = useState<"deal" | "room">("deal");
  const [roomId, setRoomId] = useState("");
  const [lookupPlayerId, setLookupPlayerId] = useState(1);
  const [lookupCardNumber, setLookupCardNumber] = useState<number | null>(null);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading">("idle");
  const [lookupError, setLookupError] = useState("");
  const [dealError, setDealError] = useState("");
  const [isSavingDeal, setIsSavingDeal] = useState(false);
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
  const [judgeRevealInterval, setJudgeRevealInterval] = useState(
    BASE_JUDGE_REVEAL_INTERVAL,
  );
  const [judgeHasFailed, setJudgeHasFailed] = useState(false);
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
    setJudgeRevealInterval(BASE_JUDGE_REVEAL_INTERVAL);
    setJudgeHasFailed(false);
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

  const handleDealPlayers = async () => {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      setDealError("カードを保存する部屋番号を入力してください。");
      return;
    }

    const values = shuffleNumbers(dealPlayerCount);
    const players = Array.from({ length: dealPlayerCount }, (_, index) => ({
      value: values[index],
      revealed: false,
    }));

    setDealError("");
    setIsSavingDeal(true);
    try {
      await saveItoRoomCards(
        normalizedRoomId,
        players.map((player) => player.value),
      );
    } catch (error) {
      setDealError(
        error instanceof Error
          ? error.message
          : "カードの保存に失敗しました。設定と通信状態を確認してください。",
      );
      setIsSavingDeal(false);
      return;
    }

    setDealPlayers(players);
    setJudgeStatus("idle");
    setJudgeRevealedCount(0);
    setJudgeResults({});
    setJudgeRevealInterval(BASE_JUDGE_REVEAL_INTERVAL);
    setJudgeHasFailed(false);
    setPendingRevealIndex(null);
    setDealAnimationId((current) => current + 1);
    setDealStatus("dealing");
    setIsSavingDeal(false);

    if (dealStatusTimeoutRef.current) {
      clearTimeout(dealStatusTimeoutRef.current);
    }
    dealStatusTimeoutRef.current = setTimeout(() => {
      setDealStatus("idle");
      dealStatusTimeoutRef.current = null;
    }, 1400);
  };

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
      const cardNumber = await getItoRoomCard(
        normalizedRoomId,
        lookupPlayerId,
      );
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
    const timeout = setTimeout(() => {
      if (previous) {
        const isCorrect = current.player.value < previous.player.value;
        setJudgeResults((results) => ({
          ...results,
          [current.index]: isCorrect,
          ...(judgeRevealedCount === 1 ? { [previous.index]: isCorrect } : {}),
        }));
        if (!isCorrect) setJudgeHasFailed(true);
        setJudgeRevealInterval(
          isCorrect && !judgeHasFailed
            ? judgeRevealInterval + JUDGE_REVEAL_INTERVAL_STEP
            : BASE_JUDGE_REVEAL_INTERVAL,
        );
      } else {
        setJudgeRevealInterval(BASE_JUDGE_REVEAL_INTERVAL);
      }
      setDealPlayers((players) =>
        players.map((player, index) =>
          index === current.index
            ? {
                ...player,
                revealed: true,
                judgeRevealOrder: judgeRevealedCount + 1,
              }
            : player,
        ),
      );
      setJudgeRevealedCount(judgeRevealedCount + 1);
      if (judgeRevealedCount + 1 >= orderedPlayers.length) {
        setJudgeStatus("complete");
      }
    }, judgeRevealInterval);

    return () => clearTimeout(timeout);
  }, [
    dealPlayers,
    judgeHasFailed,
    judgeRevealInterval,
    judgeRevealedCount,
    judgeStatus,
  ]);

  const comparedJudgePlayers = orderedJudgePlayers.slice(1);
  const judgeSucceeded =
    judgeStatus === "complete" &&
    comparedJudgePlayers.every(({ index }) => judgeResults[index] === true);
  const successfulJudgeCount = comparedJudgePlayers.filter(
    ({ index }) => judgeResults[index] === true,
  ).length;
  const showStrongFailureMessage =
    !judgeSucceeded && successfulJudgeCount >= dealPlayers.length / 2;
  const correctRankByIndex = new Map(
    dealPlayers
      .map((player, index) => ({ player, index }))
      .sort((left, right) => right.player.value - left.player.value)
      .map(({ index }, rankIndex) => [index, rankIndex + 1]),
  );
  const revealedPlayerIndex = dealPlayers.findIndex(
    (player) => player.revealed,
  );

  if (!isOpen) return null;

  return (
    <div className="absolute top-[20%] left-1/2 z-40 min-h-[min(360px,calc(100%-1rem))] w-[min(1080px,calc(100%-1rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1f2937]/90 p-4 pb-12 text-white shadow-2xl backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-orange-300">
          {activeTab === "room"
            ? "カード参照"
            : mode === "judge"
              ? "ジャッジモード"
              : "デジタルカード"}
        </div>
        <button
          type="button"
          className="text-sm text-white/70 hover:text-white"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>

      <div
        className="mb-4 flex gap-2 border-b border-white/15 pb-3"
        role="tablist"
        aria-label="デジタルカードの画面"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "deal"}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === "deal"
              ? "bg-[#f8d59d] text-slate-900"
              : "border border-white/20 bg-slate-800 text-white/75 hover:text-white"
          }`}
          onClick={() => setActiveTab("deal")}
        >
          配布
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "room"}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === "room"
              ? "bg-[#f8d59d] text-slate-900"
              : "border border-white/20 bg-slate-800 text-white/75 hover:text-white"
          }`}
          onClick={() => setActiveTab("room")}
        >
          ルーム
        </button>
      </div>

      {activeTab === "deal" ? (
        <>
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
          <span>部屋番号</span>
          <input
            value={roomId}
            onChange={(event) => {
              setRoomId(event.target.value);
              setDealError("");
              setLookupCardNumber(null);
              setLookupError("");
            }}
            className="w-40 rounded border border-white/20 bg-slate-800 px-2 py-1 text-white outline-none placeholder:text-white/30"
            placeholder="部屋番号を入力"
            aria-label="カードを保存する部屋番号"
          />
        </label>
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
            className="min-w-[240px] rounded-md bg-[#f8d59d] px-6 py-2 text-center text-sm font-bold text-slate-900 transition duration-200 hover:bg-[#f2c770] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            onClick={handleDealPlayers}
            disabled={isSavingDeal}
          >
            {isSavingDeal
              ? "カードを保存中..."
              : dealStatus === "dealing"
                ? "カードを配布中..."
                : "カードを配る"}
          </button>
        </div>
        {mode === "deal" && revealedPlayerIndex !== -1 && (
          <p className="text-2xl text-green-400">
            カードを閉じるにはカードをもう一度クリック！
          </p>
        )}
      </div>
      {dealError && (
        <p className="mb-3 text-sm text-rose-300" role="alert">
          {dealError}
        </p>
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {isSavingDeal
          ? `${dealPlayerCount}人分のカードを保存中です`
          : dealStatus === "dealing"
          ? `${dealPlayerCount}人にカードを配布中です`
          : ""}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                  setJudgeRevealInterval(BASE_JUDGE_REVEAL_INTERVAL);
                  setJudgeHasFailed(false);
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
                      className={`group relative shrink-0 rounded-xl border bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 p-1 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed ${
                        mode !== "judge" ? "disabled:opacity-50" : ""
                      } ${
                        mode === "judge"
                          ? player.judgeOrder !== undefined &&
                            judgeStatus === "idle"
                            ? "border-red-400 opacity-70"
                            : "border-[#f8d59d]/70"
                          : "border-[#f8d59d]/40"
                      } ${cardSizeClass}`}
                      aria-label={
                        mode === "judge"
                          ? `P${index + 1} ${getPlayerName(index)}のカードを${player.judgeOrder === undefined ? "順番に追加" : "順番から外す"}`
                          : `P${index + 1} ${getPlayerName(index)}のカード${player.revealed ? "を閉じる" : "を開く"}`
                      }
                    >
                      {mode === "judge" &&
                      (player.revealed ||
                        (player.judgeOrder !== undefined &&
                          player.judgeOrder <= judgeRevealedCount)) ? (
                        <div className="judge-card-flip relative flex h-full flex-col items-center justify-center rounded-lg border border-amber-200/70 bg-white pt-4 text-slate-900 shadow-inner">
                          <div className="text-[9px] font-bold text-slate-500">
                            P{index + 1}
                          </div>
                          <div className="mt-1 text-3xl leading-none font-black">
                            {player.value}
                          </div>
                          {player.judgeRevealOrder !== undefined && (
                            <div className="mt-1 text-[8px] leading-tight font-semibold text-slate-600">
                              <div>めくり順 {player.judgeRevealOrder}位</div>
                              <div>
                                正しい順位 {correctRankByIndex.get(index)}位
                              </div>
                            </div>
                          )}
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
                    {mode === "judge" && judgeResults[index] !== undefined && (
                      <span
                        className={`absolute top-1 left-1/2 z-10 -translate-x-1/2 text-xl leading-none font-black ${
                          judgeResults[index]
                            ? "text-red-500"
                            : "text-slate-900"
                        }`}
                        aria-label={judgeResults[index] ? "成功" : "失敗"}
                      >
                        {judgeResults[index] ? "○" : "×"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {mode === "judge" && judgeStatus === "complete" && (
            <div
              className={`judge-result-pop absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-2xl bg-black/35 ${
                judgeSucceeded ? "text-emerald-300" : "text-rose-300"
              }`}
              role="status"
              aria-live="assertive"
            >
              {judgeSucceeded && (
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  aria-hidden="true"
                >
                  {Array.from({ length: 36 }, (_, index) => (
                    <span
                      key={index}
                      className="judge-confetti-piece absolute top-0 h-3 w-2 rounded-sm"
                      style={{
                        left: `${(index * 37) % 100}%`,
                        backgroundColor:
                          confettiColors[index % confettiColors.length],
                        animationDelay: `${(index % 12) * 90}ms`,
                        animationDuration: `${2.2 + (index % 5) * 0.25}s`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-slate-900/95 px-10 py-6 text-5xl font-black shadow-2xl">
                <span>
                  {judgeSucceeded
                    ? "成功！！"
                    : showStrongFailureMessage
                      ? "失敗、、、！！"
                      : "失敗。。"}
                </span>
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
        <div className="flex items-center justify-center">
          <div className="rounded-lg border border-dashed border-white/20 bg-slate-800/40 px-12 py-4 text-center text-sm text-white/70">
            {mode === "judge"
              ? "ジャッジするカードはまだ配られていません。"
              : "カードはまだ配られていません。"}
          </div>
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
        </>
      ) : (
        <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 py-4">
          <p className="text-center text-sm text-white/75">
            配布時に設定した部屋番号とプレイヤーIDを入力してください。
          </p>
          <label className="flex w-full flex-col gap-1 text-sm text-white/80">
            <span>部屋番号</span>
            <input
              value={roomId}
              onChange={(event) => {
                setRoomId(event.target.value);
                setLookupCardNumber(null);
                setLookupError("");
              }}
              className="rounded border border-white/20 bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-white/30"
              placeholder="部屋番号を入力"
              aria-label="参照する部屋番号"
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-sm text-white/80">
            <span>プレイヤーID</span>
            <select
              value={lookupPlayerId}
              onChange={(event) => {
                setLookupPlayerId(Number(event.target.value));
                setLookupCardNumber(null);
                setLookupError("");
              }}
              className="rounded border border-white/20 bg-slate-800 px-3 py-2 text-white outline-none"
              aria-label="プレイヤーID"
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
          <button
            type="button"
            className="w-full rounded-md bg-[#f8d59d] px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-[#f2c770] disabled:cursor-wait disabled:opacity-60"
            onClick={handleLookupCard}
            disabled={lookupStatus === "loading"}
          >
            {lookupStatus === "loading" ? "確認中..." : "カードを確認"}
          </button>
          {lookupError && (
            <p className="text-center text-sm text-rose-300" role="alert">
              {lookupError}
            </p>
          )}
          {lookupCardNumber !== null && (
            <div
              className="flex h-40 w-28 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-5xl font-black text-slate-900 shadow-xl"
              role="status"
              aria-label={`プレイヤー${lookupPlayerId}のカードは${lookupCardNumber}です`}
            >
              {lookupCardNumber}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
