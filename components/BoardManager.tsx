"use client";

import React, { useEffect, useState } from "react";
import type { Item } from "@/app/page";
import Blackboard from "./Blackboard";
import ItemsTable from "./ItemsTable";

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
  };

  const cancel = () => {
    setPending(null);
    setModalOpen(false);
  };

  /* -------------------------
   * 黒板けし用：ルーレット抽選
   * ------------------------- */
const pickRandom = async () => {
  if (items.length === 0) return;

  const spins = 12; // 回転数（10〜16くらいが気持ちいい）

  for (let i = 0; i < spins; i++) {
    const next = items[Math.floor(Math.random() * items.length)];
    setSelected(next);

    // 後半になるほど遅くなる
    const delay = 80 + i * (20+i);
    await wait(delay);
  }
};


  return (
    <div>
      <Blackboard
        items={items}
        header={header}
        selected={selected}
        onPickRandom={pickRandom}
      />

      <div className="mt-6">
        <ItemsTable
          header={[header]}
          rows={items}
          onSelect={openConfirm}
        />
      </div>

      {/* 確認モーダル */}
      {modalOpen && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 min-w-[500px] min-h-[200px] flex flex-col">
            <h3 className="text-lg font-bold mb-3">
              このお題に変更しますか？
            </h3>

            <div className="mb-4 font-medium whitespace-pre-line flex flex-col gap-2">
              <div>--- No.{pending.id} ---</div>
              <div>{pending.title}</div>
            </div>

            <div className="mt-auto flex justify-end gap-3">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={cancel}
              >
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={confirmApply}
              >
                反映する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
