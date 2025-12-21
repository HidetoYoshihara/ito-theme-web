"use client";

import React, { useState } from "react";
import type { Item } from "@/app/page";

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
  const [selectedInternal, setSelected] = useState<Item | null>(
    Array.isArray(items) && items.length ? items[0] : header ?? null
  );

  const effective = selected ?? selectedInternal;

  const totalItems = items.length;

  const pickRandom = <T,>(list: T[]) =>
    list[Math.floor(Math.random() * list.length)];

  const showRandom = () => {
    if (typeof onPickRandom === "function") {
      onPickRandom();
      return;
    }

    const list = Array.isArray(items) && items.length ? items : [];
    if (list.length === 0) return;
    const i = pickRandom(list) as Item;
    setSelected(i);
  };

  return (
    <div className="flex justify-center">
      <div
        className={`relative w-full max-w-[1280px] h-[440px] text-white/90 ${className}`}
      >
        <img
          src="/images/スピーカー.png"
          alt="スピーカー"
          className="absolute top-[-66px] left-1/2 -translate-x-1/2 w-[120px]"
        />

        <img
          src="/images/ito.png"
          alt="ito"
          className="absolute top-[-32px] left-[-20px] w-[60px]"
        />

        {/* レスポンシブ未対応 */}
        <img
          src="/images/黒板.png"
          alt="黒板"
          className="absolute w-full h-full"
        />

        <img
          src="/images/黒板けし.png"
          alt="黒板けし"
          className="absolute bottom-[34px] right-[10%] h-[50px] cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="黒板けし（ランダム表示）"
          onClick={showRandom}
          onKeyDown={(e) => {
            const k = (e as React.KeyboardEvent).key;
            if (
              k === "Enter" ||
              k === " " ||
              k === "Spacebar" ||
              k === "Space"
            ) {
              e.preventDefault();
              showRandom();
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
        <div className="absolute top-[14%] left-[6%] flex items-center gap-4">
          <div className="font-bold w-[48px]">{header.title}</div>
          <div className="text-4xl whitespace-pre-line border-b px-4 w-[1000px] h-[132px] flex items-center">
            {effective?.title ?? "### 黒板けしをクリック！ ###"}
          </div>
        </div>

        {/* #タグ */}
        <div className="absolute top-[50%] left-[6%] flex items-center gap-4">
          <div className="font-bold w-[48px]">{header.extra}</div>
          <div className="text-2xl border-b px-3 w-[500px] h-[34px]">
            {effective?.extra}
          </div>
        </div>

        {/* 制作者・フラグ・表示／総数 */}
        <div className="absolute top-[66%] left-[9%] flex items-center gap-6">
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
        <div className="absolute top-[36px] right-[60px]">
          <span className="px-1">0</span>
          {/* <span className="text-red-300 px-1">2</span> */}
          連チャン！
        </div>
      </div>
    </div>
  );
}
