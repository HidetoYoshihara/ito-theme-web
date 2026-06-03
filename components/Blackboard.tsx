"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Item } from "@/app/page";
// import SchoolClock from "./SchoolClock";
import dynamic from "next/dynamic";

import CountdownTimer from "@/components/CountdownTimer";
import { images } from "@/lib/imagePaths";

const SchoolClock = dynamic(() => import("./SchoolClock"), {
  ssr: false,
});

type Props = {
  items: Item[];
  header: Item;
  className?: string;
  selected?: Item | null;
  onPickRandom?: () => void;
  totalItems: number;
  rouletteCompleteCount?: number;
};

const DivFlex = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`flex items-center gap-2 ${className}`}>{children}</div>;

export default function Blackboard({
  items,
  header,
  className = "",
  selected,
  onPickRandom,
  totalItems,
  rouletteCompleteCount,
}: Props) {
  const today = new Date();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const month = today.getMonth() + 1;
  const date = today.getDate();
  const weekday = weekdays[today.getDay()];

  const [selectedInternal, setSelected] = useState<Item | null>(
    Array.isArray(items) && items.length ? items[0] : (header ?? null),
  );

  // クリック時にito画像を横回転させるフリップ状態
  const [flip, setFlip] = useState(false);
  const [showLoveTag, setShowLoveTag] = useState(false);
  const [localRouletteCompleteCount, setLocalRouletteCompleteCount] =
    useState(0);

  const effective = selected ?? selectedInternal;
  const isLoveTag = Boolean(effective?.tag?.includes("恋愛"));
  const completedRouletteCount =
    (rouletteCompleteCount ?? 0) + localRouletteCompleteCount;
  const prevRouletteCompleteCountRef = useRef(completedRouletteCount);

  useEffect(() => {
    if (completedRouletteCount === prevRouletteCompleteCountRef.current) return;
    prevRouletteCompleteCountRef.current = completedRouletteCount;
    if (!isLoveTag) return;

    setShowLoveTag(true);
  }, [completedRouletteCount, isLoveTag]);

  useEffect(() => {
    if (!isLoveTag) {
      setShowLoveTag(false);
    }
  }, [isLoveTag]);

  useEffect(() => {
    // 直接選択でお題が恋愛になった場合にもスライドを表示する
    if (isLoveTag) {
      setShowLoveTag(true);
    }
  }, [isLoveTag, effective?.id]);

  // ローカルで使うウエイト
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const pickRandom = <T,>(list: T[]) =>
    list[Math.floor(Math.random() * list.length)];

  // 押下中はグレーアウト＆無効にするフラグ
  const [isSpinning, setIsSpinning] = useState(false);

  // 連チャンカウンター（ローカル保存）
  const [streak, setStreak] = useState<number>(() => {
    try {
      if (typeof window === "undefined") return 0;
      const s = localStorage.getItem("streak");
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("streak", String(streak));
    } catch {}
  }, [streak]);

  const showRandom = async () => {
    // 二重押下防止
    if (isSpinning) return;

    // 恋愛スライドは毎回クリアして、最終決定時に再表示
    setShowLoveTag(false);

    // アニメーションを確実に再発火させる（同じ値を set しても再発火しないため）
    setFlip(false);
    // 次フレームでアニメーションを再付与
    requestAnimationFrame(() => setFlip(true));
    setIsSpinning(true);

    if (typeof onPickRandom === "function") {
      try {
        // 外部のルーレット処理（BoardManager の pickRandom）を待つ
        await onPickRandom();
      } finally {
        setIsSpinning(false);
      }
      return;
    }

    // 内部でルーレットを行う場合（BoardManager が提供しない環境）
    const list = Array.isArray(items) && items.length ? items : [];
    if (list.length === 0) {
      setIsSpinning(false);
      return;
    }

    const spins = 12; // 回転回数
    for (let i = 0; i < spins; i++) {
      const next = pickRandom(list) as Item;
      setSelected(next);

      // 後半になるほど遅くなる
      const delay = 80 + i * (20 + i);
      await wait(delay);
    }

    setLocalRouletteCompleteCount((count) => count + 1);
    setIsSpinning(false);
  };

  return (
    <div className="flex justify-center">
      {/* 全体ラッパー（周辺装飾と黒板の位置関係を管理） */}
      <div className="relative w-full max-w-[1240px]">
        {/* 周辺装飾コンテナ（周辺画像のみ） */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src={images.ito}
            alt="ito"
            className={`absolute top-[-32px] left-[-40px] w-[60px] ${flip ? "ito-flip" : ""}`}
            onAnimationEnd={() => setFlip(false)}
          />

          <img
            src={images.speaker}
            alt="スピーカー"
            className="absolute top-[-62px] left-1/2 w-[120px] -translate-x-1/2"
          />

          {/* 時計 */}
          <SchoolClock
            size={100}
            className="absolute top-[-60px] right-[-60px]"
          />
        </div>

        {/* 黒板コンテナ（黒板背景とその内容） */}
        <div
          className={`relative mt-8 h-[440px] w-full text-white/90 ${className}`}
        >
          {/* レスポンシブ未対応 */}
          <img
            src={images.blackboard}
            alt="黒板"
            className="absolute h-full w-full"
          />

          <div className="absolute right-[90px]">
            <div className="absolute top-[110px] w-[20px] text-center">
              {month}
            </div>
            <div className="absolute top-[160px] w-[20px] text-center">
              {date}
            </div>
            <div className="absolute top-[204px] w-[20px] text-center">
              {weekday}
            </div>
          </div>

          <img
            src={images.blackboardEraser}
            alt="黒板けし"
            className={`absolute right-[10%] bottom-[34px] h-[50px] ${isSpinning ? "pointer-events-none cursor-not-allowed opacity-40 grayscale" : "cursor-pointer"}`}
            role="button"
            tabIndex={isSpinning ? -1 : 0}
            aria-label="黒板けし（ランダム表示）"
            aria-disabled={isSpinning}
            onClick={() => {
              if (isSpinning) return;
              void showRandom();
            }}
            onKeyDown={(e) => {
              if (isSpinning) return;
              const k = (e as React.KeyboardEvent).key;
              if (
                k === "Enter" ||
                k === " " ||
                k === "Spacebar" ||
                k === "Space"
              ) {
                e.preventDefault();
                void showRandom();
              }
            }}
          />

          <img
            src={images.chalkWhite}
            alt="チョーク白"
            className="absolute right-[45%] bottom-[40px] h-[20px]"
          />

          <img
            src={images.chalkRed}
            alt="チョーク赤"
            className="absolute right-[34%] bottom-[40px] h-[20px]"
          />

          <img
            src={images.letters}
            alt="文字"
            className="absolute right-[5%] bottom-[50px] w-[36px] opacity-85"
          />

          <img
            src={images.loveTagSlideIn}
            alt="恋愛"
            className={`pointer-events-none absolute top-[428px] right-[140px] w-[260px] opacity-0 ${showLoveTag ? "love-tag-slide-in" : ""}`}
          />

          {/* お題 */}
          {/* FIXME：レスポンシブ未対応(スマホ側) */}
          <div className="absolute top-[8%] left-[5%] flex items-center">
            <div className="w-[52px] font-bold">{header.title}</div>
            <div className="flex h-[160px] w-[1000px] items-center border-b px-2 text-4xl whitespace-pre-line">
              {effective?.title ?? "### 黒板けしをクリック！ ###"}
            </div>
          </div>

          {/* #タグ */}
          <div className="absolute top-[50%] left-[5%] flex items-center">
            <div className="w-[52px] font-bold">{header.tag}</div>
            <div className="h-[34px] w-[620px] truncate border-b px-3 text-2xl">
              {effective?.tag}
            </div>
          </div>

          {/* 制作者・フラグ・表示／総数 */}
          <div className="absolute top-[66%] left-[8%] flex items-center gap-6">
            <DivFlex>
              <div className="font-bold">{header.creator}</div>
              <div className="h-[32px] w-[150px] border-b px-2 text-center text-xl">
                {effective?.creator}
              </div>
            </DivFlex>

            <DivFlex>
              <div className="font-bold">{header.flag}</div>
              <div className="h-[32px] w-[60px] border-b px-2 text-center text-xl">
                {effective?.flag}
              </div>
            </DivFlex>

            <DivFlex>
              <div className="font-bold">{"表示中／総数"}</div>
              <div className="h-[32px] w-[140px] border-b px-2 text-center text-xl">
                {items.length}／{totalItems}
                {/* {filterdItems}／{totalItems} */}
              </div>
            </DivFlex>
          </div>

          {/* 連チャンカウンター */}
          <div className="absolute top-[30px] right-[60px] flex items-center gap-2">
            {/* 成功ボタン→インクリメント */}
            <button
              type="button"
              className="cursor-pointer rounded bg-green-600/70 px-2 py-1 text-white/70 hover:bg-green-500 disabled:opacity-40"
              onClick={() => setStreak((s) => s + 1)}
              aria-label="成功（増加）"
            >
              成功
            </button>

            <div className="px-3 text-center">
              <span
                className={`px-2 text-[18px] font-bold ${streak > 0 ? "text-green-300/70" : streak < 0 ? "text-red-300/70" : "text-white/70"}`}
              >
                {streak}
              </span>
              <div className="text-xs text-white/70">連チャン！</div>
            </div>

            {/* 失敗ボタン→デクリメント */}
            <button
              type="button"
              className="cursor-pointer rounded bg-red-600/70 px-2 py-1 text-white/70 hover:bg-red-500 disabled:opacity-40"
              onClick={() => setStreak((s) => s - 1)}
              aria-label="失敗（減少）"
            >
              失敗
            </button>

            {/* クリアボタン→クリア */}
            <button
              type="button"
              className="cursor-pointer rounded bg-gray-600/70 px-2 py-1 text-[10px] text-white/70 hover:bg-gray-500 disabled:opacity-40"
              onClick={() => setStreak(0)}
              aria-label="クリア"
            >
              クリア
            </button>
          </div>

          <div className="absolute right-[150px] bottom-[88px]">
            <CountdownTimer />
          </div>
        </div>
      </div>
    </div>
  );
}
