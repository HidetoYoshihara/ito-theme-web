"use client";

import React, { useState } from "react";
import type { Item } from "@/app/page";
import Blackboard from "./Blackboard";
import ItemsTable from "./ItemsTable";

type Props = {
  items: Item[];
  header: Item;
};

export default function BoardManager({ items, header }: Props) {
  const [selected, setSelected] = useState<Item | null>(
    items && items.length ? items[0] : header ?? null
  );
  const [pending, setPending] = useState<Item | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const pickRandom = () => {
    if (!items || items.length === 0) return;
    const i = items[Math.floor(Math.random() * items.length)];
    // 黒板けしは確認不要ので直接反映
    setSelected(i);
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
        <ItemsTable header={[header]} rows={items} onSelect={openConfirm} />
      </div>

      {modalOpen && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 min-w-[500px] min-h-[200px] flex flex-col">
            <h3 className="text-lg font-bold mb-3">このお題に変更しますか？</h3>
            <div className="mb-4">
              <div className="font-medium whitespace-pre-line">
                {pending.title}
              </div>
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
