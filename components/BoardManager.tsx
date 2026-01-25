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
  const [modalOpen, setModalOpen] = useState(false);

  // フラグ絞り込み用
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  // タグ絞り込み用
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    setSelectedFlags(uniqueFlags);
  }, [items]);

  /* -------------------------
   * タグ初期化
   * ------------------------- */
  useEffect(() => {
    const allTags = items.flatMap((item) =>
      item.tag.split("#").filter((t) => t.trim() !== ""),
    );
    const uniqueTags = Array.from(new Set(allTags));
    setSelectedTags(uniqueTags);
  }, [items]);

  /* -------------------------
   * テーブルから選択 → 確認
   * ------------------------- */
  const openConfirm = (item: Item) => {
    setPending(item);
    setModalOpen(true);
  };

  const confirmApply = () => {
    if (pending) setSelected(pending);
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

    const spins = 12; // 回転数（10〜16くらいが気持ちいい）

    for (let i = 0; i < spins; i++) {
      const next =
        filteredItems[Math.floor(Math.random() * filteredItems.length)];
      setSelected(next);

      // 後半になるほど遅くなる
      const delay = 80 + i * (20 + i);
      await wait(delay);
    }
  };

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
      />

      <FlagCheckBoxList
        flags={Array.from(new Set(items.map((item) => item.flag)))}
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
            <div className="flex min-h-[200px] w-full max-w-[500px] flex-col rounded-lg bg-white p-6">
              <h3 className="mb-3 text-lg font-bold">
                このお題に変更しますか？
              </h3>

              <div className="mb-4 flex flex-col gap-2 font-medium whitespace-pre-line">
                <div>--- No.{pending.id} ---</div>
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
