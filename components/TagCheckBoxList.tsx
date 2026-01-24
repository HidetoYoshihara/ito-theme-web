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
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-2">タグで絞り込み</h4>
      <div className="flex gap-2 mb-2">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
          onClick={selectAll}
        >
          全選択
        </button>
        <button
          className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
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
  );
}
