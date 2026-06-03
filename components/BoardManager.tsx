"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Item } from "@/app/page";
import Blackboard from "./Blackboard";
import ItemsTable from "./ItemsTable";
import FlagCheckBoxList from "./FlagCheckBoxList";
import TagCheckBoxList from "./TagCheckBoxList";

type Props = {
  items: Item[];
  header: Item;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function BoardManager({ items, header }: Props) {
  // 現在表示中のお題
  const [selected, setSelected] = useState<Item | null>(null);

  // テーブル選択 → 確認モーダル用
  const [pending, setPending] = useState<Item | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // フラグを抽出（⚠️は後ろに回す）
  // const flags = Array.from(new Set(items.map((item) => item.flag)));
  const flags = Array.from(new Set(items.map((item) => item.flag))).sort(
    (a, b) => {
      if (a === "⚠️") return 1;
      if (b === "⚠️") return -1;
      return 0;
    },
  );

  // フラグ絞り込み用
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  // タグ絞り込み用
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rouletteCompleteCount, setRouletteCompleteCount] = useState(0);
  const [decidedItem, setDecidedItem] = useState<Item | null>(null);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);

  /* -------------------------
   * 初期選択（items / header 変更に追従）
   * ------------------------- */
  useEffect(() => {
    if (items.length > 0) {
      setSelected(items[0]);
    } else {
      setSelected(header ?? null);
    }
  }, [items, header]);

  /* -------------------------
   * フラグ初期化
   * ------------------------- */
  useEffect(() => {
    const uniqueFlags = Array.from(new Set(items.map((item) => item.flag)));
    const defaultSelectedFlags = uniqueFlags.filter((flag) => flag !== "⚠️");
    setSelectedFlags(defaultSelectedFlags);
  }, [items]);

  /* -------------------------
   * タグ初期化
   * ------------------------- */
  useEffect(() => {
    const allTags = items.flatMap((item) =>
      item.tag.split("#").filter((t) => t.trim() !== ""),
    );
    const uniqueTags = Array.from(new Set(allTags));
    const excludedTags = ["R指定", "マニアック"];
    const defaultSelectedTags = uniqueTags.filter(
      (tag) => !excludedTags.includes(tag.trim()),
    );
    setSelectedTags(defaultSelectedTags);
  }, [items]);

  /* -------------------------
   * テーブルから選択 → 確認
   * ------------------------- */
  const openConfirm = (item: Item, index?: number) => {
    setPending(item);
    setPendingIndex(typeof index === "number" ? index : null);
    setModalOpen(true);
  };

  const confirmApply = () => {
    if (pending) {
      setSelected(pending);
      setDecidedItem(pending);
    }
    setPending(null);
    setModalOpen(false);
    window.scrollTo(0, 0);
  };

  const cancel = () => {
    setPending(null);
    setModalOpen(false);
  };

  /* -------------------------
   * 黒板けし用：ルーレット抽選
   * ------------------------- */
  const filteredItems = items.filter(
    (item) =>
      selectedFlags.includes(item.flag) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => item.tag.includes(`#${tag}`))),
  );

  const pickRandom = async () => {
    if (filteredItems.length === 0) return;

    // ルーレット開始時に背景をリセット
    setDecidedItem(null);
    setIsRouletteSpinning(true);

    const spins = 12; // 回転数（10〜16くらいが気持ちいい）
    let next: Item = filteredItems[0];

    for (let i = 0; i < spins; i++) {
      next = filteredItems[Math.floor(Math.random() * filteredItems.length)];
      setSelected(next);

      // 後半になるほど遅くなる
      const delay = 80 + i * (20 + i);
      await wait(delay);
    }

    setRouletteCompleteCount((count) => count + 1);
    // ルーレット完了後に背景色を適用
    setDecidedItem(next);
    setIsRouletteSpinning(false);
  };

  const effective = decidedItem;
  const isLoveTag = Boolean(effective?.tag?.includes("恋愛"));
  const isHorrorTag = Boolean(effective?.tag?.includes("ホラー"));
  const isDangerTag = Boolean(effective?.tag?.includes("ヤバい"));
  const isContentTag = Boolean(effective?.tag?.includes("コンテンツ系"));
  const isFairyTag = Boolean(effective?.tag?.includes("童話"));
  const isRTag = Boolean(effective?.tag?.includes("R指定"));
  const isFirstItem = effective?.id === 0;

  // 背景色の設定
  const bodyBackground = effective
    ? isFirstItem
      ? "rainbow"
      : isLoveTag
        ? "#ffe7f8"
        : isHorrorTag
          ? "#120008"
          : isDangerTag
            ? "#e08a8d"
            : isContentTag
              ? "#ffffb0"
              : isFairyTag
                ? "#e6fff0"
                : isRTag
                  ? "#7f2b68"
                  : "#e9e9de"
    : "#e9e9de";

  const bodyTextColor = effective
    ? isFirstItem
      ? "#1f2937"
      : isHorrorTag || isRTag
        ? "#ffffff"
        : "#1f2937"
    : "#000";

  useEffect(() => {
    if (bodyBackground === "rainbow") {
      document.body.style.background =
        "linear-gradient(90deg, #ff4fcf 0%, #ffcd1d 22%, #77f7a4 45%, #6ba7ff 68%, #d77dff 100%)";
      document.body.style.backgroundColor = "";
    } else {
      document.body.style.background = "";
      document.body.style.backgroundColor = bodyBackground;
    }
    document.body.style.color = bodyTextColor;
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, [bodyBackground, bodyTextColor]);

  /* -------------------------
   * selected の調整（フィルタリング変更に追従）
   * ------------------------- */
  useEffect(() => {
    if (
      filteredItems.length > 0 &&
      selected &&
      !filteredItems.includes(selected)
    ) {
      setSelected(filteredItems[0]);
      setDecidedItem(null);
    }
  }, [filteredItems, selected]);

  return (
    <div>
      <Blackboard
        items={filteredItems}
        header={header}
        selected={selected}
        onPickRandom={pickRandom}
        totalItems={items.length}
        rouletteCompleteCount={rouletteCompleteCount}
        isExternalSpinning={isRouletteSpinning}
      />

      <FlagCheckBoxList
        flags={flags}
        selectedFlags={selectedFlags}
        onChange={setSelectedFlags}
      />

      <TagCheckBoxList
        tags={Array.from(
          new Set(
            items.flatMap((item) =>
              item.tag.split("#").filter((t) => t.trim() !== ""),
            ),
          ),
        )}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
      />

      <div className="mt-6"></div>
      <ItemsTable
        header={[header]}
        rows={filteredItems}
        onSelect={openConfirm}
      />

      {/* ◎createPortal：親コンポーネントCSSの影響を受けずに画面全体に表示したい場合に有効！ */}
      {modalOpen &&
        pending &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex min-h-[200px] w-full max-w-[500px] flex-col rounded-lg bg-white p-6 text-black">
              <h3 className="mb-3 text-lg font-bold">
                このお題に変更しますか？
              </h3>

              <div className="mb-4 flex flex-col gap-2 font-medium whitespace-pre-line">
                <div>
                  --- No.
                  {pendingIndex !== null ? pendingIndex + 1 : pending?.id} ---
                </div>
                <div>{pending.title}</div>
              </div>

              <div className="mt-auto flex justify-end gap-3">
                <button
                  className="rounded bg-gray-200 px-3 py-1"
                  onClick={cancel}
                >
                  キャンセル
                </button>
                <button
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                  onClick={confirmApply}
                >
                  変更する
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
