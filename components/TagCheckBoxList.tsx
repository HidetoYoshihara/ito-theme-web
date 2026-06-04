"use client";

import React, { useState } from "react";

type Props = {
  tags: string[];
  selectedTags: string[];
  onChange: (selected: string[]) => void;
};

export default function TagCheckBoxList({
  tags,
  selectedTags,
  onChange,
}: Props) {
  const [showInfo, setShowInfo] = useState(false);

  const handleCheckboxChange = (tag: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTags, tag]);
    } else {
      onChange(selectedTags.filter((t) => t !== tag));
    }
  };

  const selectAll = () => {
    onChange(tags);
  };

  const deselectAll = () => {
    onChange([]);
  };

  // console.log(tags);
  // console.log(selectedTags);

  return (
    <div className="mb-4 flex flex-col items-center">
      <div className="relative w-[1000px]">
        <div className="mb-2 flex items-center gap-2">
          <h4 className="text-md font-semibold">タグで絞り込み</h4>
          <div className="relative">
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-gray-300 bg-white text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setShowInfo((prev) => !prev)}
              aria-expanded={showInfo}
              aria-label="タグ絞り込みの説明を表示"
            >
              ？
            </button>

            {showInfo && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => setShowInfo(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full right-0 z-20 mt-2 w-[320px] rounded-xl border border-black/10 bg-white p-4 text-left text-sm shadow-lg">
                  <div className="mb-2 font-semibold">タグの説明</div>
                  <p className="leading-tight text-slate-700">
                    選択したタグに応じて、黒板けしで表示されるお題の背景やスライドが変わります。
                  </p>
                  {/* 随時更新必要！ */}
                  <ul className="mt-3 space-y-1 pl-4 text-slate-600">
                    <li>恋愛：ピンク系背景＋恋愛スライド</li>
                    <li>ホラー：暗い黒背景</li>
                    <li>ヤバい：赤系背景</li>
                    <li>コンテンツ系：黄色系背景</li>
                    <li>童話：淡い緑背景</li>
                    <li>R指定：紫系背景</li>
                    <li>※No.1のお題は虹色背景</li>
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">
                    画面外をクリックすると閉じます。
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-2 flex gap-2">
          <button
            className="rounded bg-blue-500 px-2 py-1 text-sm text-white"
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            className="rounded bg-gray-500 px-2 py-1 text-sm text-white"
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={(e) => handleCheckboxChange(tag, e.target.checked)}
              />
              <span className="text-sm">#{tag}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
