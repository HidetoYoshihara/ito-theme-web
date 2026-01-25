"use client";

import React from "react";

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

  return (
    <div className="mb-4 flex flex-col items-center">
      <div className="w-[1000px]">
        <h4 className="text-md mb-2 font-semibold">タグで絞り込み</h4>
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
