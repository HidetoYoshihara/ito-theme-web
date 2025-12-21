"use client";

import React, { useState } from "react";
import type { Item } from "@/app/page";

type Props = {
  items: Item[];
  header: Item;
  className?: string;
};

const DivFlex = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`flex items-center gap-3 ${className}`}>{children}</div>;

export default function Blackboard({ items, header, className = "" }: Props) {
  const [selected, setSelected] = useState<Item | null>(
    Array.isArray(items) && items.length ? items[0] : null
  );

  const totalItems = items.length;

  const pickRandom = <T,>(list: T[]) =>
    list[Math.floor(Math.random() * list.length)];
  const showRandom = () => {
    const list = Array.isArray(items) && items.length ? items : [];
    if (list.length === 0) return;
    const i = pickRandom(list) as Item;
    setSelected(i);
  };

  return (
    <div className={`relative w-full h-[340px] text-white ${className}`}>
      <img
        src="/images/スピーカー.png"
        alt="スピーカー"
        className="absolute top-[-66px] left-1/2 -translate-x-1/2 w-[120px]"
      />

      <img
        src="/images/黒板.png"
        alt="黒板"
        className="absolute inset-0 w-full h-full"
      />

      <img
        src="/images/黒板けし.png"
        alt="黒板けし"
        className="absolute bottom-[24px] right-[10%] h-[50px] cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="黒板けし（ランダム表示）"
        onClick={showRandom}
        onKeyDown={(e) => {
          const k = (e as React.KeyboardEvent).key;
          if (k === "Enter" || k === " " || k === "Spacebar" || k === "Space") {
            e.preventDefault();
            showRandom();
          }
        }}
      />

      <img
        src="/images/チョーク白.png"
        alt="チョーク白"
        className="absolute bottom-[30px] right-[45%] h-[20px]"
      />

      <img
        src="/images/チョーク赤.png"
        alt="チョーク赤"
        className="absolute bottom-[29px] right-[34%] h-[20px]"
      />

      <img
        src="/images/文字.png"
        alt="文字"
        className="absolute bottom-[20px] right-[5%] w-[36px] opacity-85"
      />

      {/* お題 */}
      <div className="absolute top-[18%] left-[6%] flex items-center gap-6 h-[56px]">
        <div className="font-bold">{header.title}</div>
        <div className="text-3xl max-w-[1000px] whitespace-pre-line">
          {selected?.title ?? "### 黒板けしをクリック！ ###"}
        </div>
      </div>

      {/* #タグ */}
      <div className="absolute top-[48%] left-[6%] flex items-center gap-6 h-[30px]">
        <div className="font-bold">{header.extra}</div>
        <div className="text-2xl">{selected?.extra}</div>
      </div>

      {/* 制作者・フラグ・表示／総数 */}
      <div className="absolute top-[64%] left-[9%] flex items-center gap-6">
        <DivFlex>
          <div className="font-bold">{header.notes}</div>
          <div className="text-xl w-[150px] border-b h-[30px] px-2">
            {selected?.notes}
          </div>
        </DivFlex>

        <DivFlex>
          <div className="font-bold">{header.category}</div>
          <div className="text-xl w-[60px] border-b h-[30px] px-2">
            {selected?.category}
          </div>
        </DivFlex>

        <DivFlex>
          <div className="font-bold">{"表示中／総数"}</div>
          <div className="text-xl w-[140px] border-b h-[30px] px-2">
            {totalItems}／{totalItems}
          </div>
        </DivFlex>
      </div>
    </div>
  );
}
