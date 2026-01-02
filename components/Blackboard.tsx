"use client";

import React, { useState, useEffect } from "react";
import type { Item } from "@/app/page";
// import SchoolClock from "./SchoolClock";
import dynamic from "next/dynamic";

const SchoolClock = dynamic(() => import("./SchoolClock"), {
  ssr: false,
});


type Props = {
  items: Item[];
  header: Item;
  className?: string;
  selected?: Item | null;
  onPickRandom?: () => void;
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
}: Props) {

  const today = new Date();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const month = today.getMonth() + 1;
  const date = today.getDate();
  const weekday = weekdays[today.getDay()];

  const [selectedInternal, setSelected] = useState<Item | null>(
    Array.isArray(items) && items.length ? items[0] : header ?? null
  );

  // クリック時にito画像を横回転させるフリップ状態
  const [flip, setFlip] = useState(false);

  const effective = selected ?? selectedInternal;

  const totalItems = items.length;

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

    setIsSpinning(false);
  };

  return (
    <div className="flex justify-center">
      <div
        className={`relative w-full max-w-[1240px] h-[440px] text-white/90 ${className}`}
      >
        <img
          src="/images/ito.png"
          alt="ito"
              className={`absolute top-[-32px] left-[-40px] w-[60px] ${flip ? "ito-flip" : ""}`}
              onAnimationEnd={() => setFlip(false)}
        />

        <img
          src="/images/スピーカー.png"
          alt="スピーカー"
          className="absolute top-[-66px] left-1/2 -translate-x-1/2 w-[120px]"
        />

        {/* <SchoolClock /> */}
        <SchoolClock size={100} className="absolute top-[-60px] right-[-60px]" />

        {/* レスポンシブ未対応 */}
        <img
          src="/images/黒板.png"
          alt="黒板"
          className="absolute w-full h-full"
        />
        
        <div className="absolute right-[90px]">
          <div className="absolute top-[110px] w-[20px] text-center">{month}</div>
          <div className="absolute top-[160px] w-[20px] text-center">{date}</div>
          <div className="absolute top-[204px] w-[20px] text-center">{weekday}</div>
        </div>

        <img
          src="/images/黒板けし.png"
          alt="黒板けし"
          className={`absolute bottom-[34px] right-[10%] h-[50px] ${isSpinning ? "opacity-40 cursor-not-allowed pointer-events-none grayscale" : "cursor-pointer"}`}
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
          src="/images/チョーク白.png"
          alt="チョーク白"
          className="absolute bottom-[40px] right-[45%] h-[20px]"
        />

        <img
          src="/images/チョーク赤.png"
          alt="チョーク赤"
          className="absolute bottom-[40px] right-[34%] h-[20px]"
        />

        <img
          src="/images/文字.png"
          alt="文字"
          className="absolute bottom-[50px] right-[5%] w-[36px] opacity-85"
        />

        {/* お題 */}
        {/* FIXME：レスポンシブ未対応(スマホ側) */}
        <div className="absolute top-[14%] left-[5%] flex items-center">
          <div className="font-bold w-[52px]">{header.title}</div>
          <div className="text-4xl whitespace-pre-line border-b px-2 w-[1000px] h-[132px] flex items-center">
            {effective?.title ?? "### 黒板けしをクリック！ ###"}
          </div>
        </div>

        {/* #タグ */}
        <div className="absolute top-[50%] left-[5%] flex items-center">
          <div className="font-bold w-[52px]">{header.extra}</div>
          <div className="text-2xl border-b px-3 w-[500px] h-[34px]">
            {effective?.extra}
          </div>
        </div>

        {/* 制作者・フラグ・表示／総数 */}
        <div className="absolute top-[66%] left-[8%] flex items-center gap-6">
          <DivFlex>
            <div className="font-bold">{header.notes}</div>
            <div className="text-xl w-[150px] border-b h-[32px] px-2 text-center">
              {effective?.notes}
            </div>
          </DivFlex>

          <DivFlex>
            <div className="font-bold">{header.category}</div>
            <div className="text-xl w-[60px] border-b h-[32px] px-2 text-center">
              {effective?.category}
            </div>
          </DivFlex>

          <DivFlex>
            <div className="font-bold">{"表示中／総数"}</div>
            <div className="text-xl w-[140px] border-b h-[32px] px-2 text-center">
              {"X"}／{totalItems}
            </div>
          </DivFlex>
        </div>
        {/* 成功ボタン→インクリメント */}
        {/* 失敗ボタン→デクリメント */}
        {/* クリアボタン→クリア */}

        {/* 連チャンカウンター */}
        <div className="absolute top-[30px] right-[60px] flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 bg-green-600/70 rounded text-white/70 hover:bg-green-500 disabled:opacity-40 cursor-pointer"
            onClick={() => setStreak((s) => s + 1)}
            aria-label="成功（増加）"
          >
            成功
          </button>

          <div className="px-3 text-center">
            <span className={`px-2 font-bold text-[18px] ${streak > 0 ? "text-green-300/70" : streak < 0 ? "text-red-300/70" : "text-white/70"}`}>
              {streak}
            </span>
            <div className="text-xs text-white/70">連チャン！</div>
          </div>

          <button
            type="button"
            className="px-2 py-1 bg-red-600/70 rounded text-white/70 hover:bg-red-500 disabled:opacity-40 cursor-pointer"
            onClick={() => setStreak((s) => s - 1)}
            aria-label="失敗（減少）"
          >
            失敗
          </button>

          <button
            type="button"
            className="px-2 py-1 bg-gray-600/70 rounded text-white/70 text-[10px] hover:bg-gray-500 disabled:opacity-40 cursor-pointer"
            onClick={() => setStreak(0)}
            aria-label="クリア"
          >
            クリア
          </button>
        </div>
      </div>
    </div>
  );
}
