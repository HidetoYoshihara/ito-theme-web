"use client";

import React, { useState } from "react";

import FilterCheckbox from "./FilterCheckbox";

type Props = {
  tags: string[];
  selectedTags: string[];
  excludedTags?: string[];
  onChange: (selected: string[]) => void;
};

export default function TagCheckBoxList({
  tags,
  selectedTags,
  excludedTags = [],
  onChange,
}: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [pendingRestrictedTag, setPendingRestrictedTag] = useState<
    string | null
  >(null);

  const formatLabel = (tag: string) => {
    if (tag.trim() === "") return "空白";
    return `#${tag}`;
  };

  const handleCheckboxChange = (tag: string, checked: boolean) => {
    if (checked && tag === "R指定") {
      setPendingRestrictedTag(tag);
      return;
    }

    if (checked) {
      onChange(
        selectedTags.includes(tag) ? selectedTags : [...selectedTags, tag],
      );
    } else {
      onChange(selectedTags.filter((t) => t !== tag));
    }
  };

  const confirmRestrictedTag = () => {
    if (pendingRestrictedTag) {
      onChange(
        selectedTags.includes(pendingRestrictedTag)
          ? selectedTags
          : [...selectedTags, pendingRestrictedTag],
      );
    }
    setPendingRestrictedTag(null);
  };

  const cancelRestrictedTag = () => {
    setPendingRestrictedTag(null);
  };

  const selectAll = () => {
    onChange(tags.filter((tag) => !excludedTags.includes(tag.trim())));
  };

  const deselectAll = () => {
    onChange([]);
  };

  return (
    <div className="mb-4 flex flex-col items-center">
      <div className="relative w-[1000px]">
        <div className="mb-2 flex items-center gap-2">
          <h4 className="text-base font-semibold text-slate-800">
            タグで絞り込み
          </h4>
          <div className="relative">
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
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
                <div className="absolute top-full right-0 z-20 mt-2 w-[320px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm shadow-lg">
                  <div className="mb-2 font-semibold text-slate-800">
                    タグの説明
                  </div>
                  <p className="leading-tight text-slate-700">
                    選択したタグに応じて、黒板けしで表示されるお題の背景やスライドが変わります。
                  </p>
                  <ul className="mt-3 space-y-1 pl-4 text-slate-600">
                    <li>恋愛：ピンク系背景＋恋愛スライド</li>
                    <li>ホラー：暗い黒背景</li>
                    <li>ヤバい：赤系背景</li>
                    <li>コンテンツ系：黄色系背景</li>
                    <li>童話：淡い緑背景</li>
                    <li>R指定：紫系背景</li>
                    <li>※No.1のお題は虹色背景</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-sky-200 bg-sky-400 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
            onClick={selectAll}
          >
            デフォルト
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            onClick={deselectAll}
          >
            クリア
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <FilterCheckbox
              key={tag || "empty-tag"}
              checked={selectedTags.includes(tag)}
              onChange={(checked) => handleCheckboxChange(tag, checked)}
              label={formatLabel(tag)}
              className="min-w-[120px]"
            />
          ))}
        </div>

        {pendingRestrictedTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-bold text-slate-800">
                年齢確認
              </h3>
              <p className="mb-4 leading-relaxed text-slate-700">
                「#R指定」を選択すると、18歳以上の方が対象となるお題を含みます。
                続行しますか？
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={cancelRestrictedTag}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                  onClick={confirmRestrictedTag}
                >
                  18歳以上です
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
