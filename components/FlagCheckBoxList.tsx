"use client";

import React from "react";

type Props = {
  flags: string[];
  selectedFlags: string[];
  onChange: (selected: string[]) => void;
};

export default function TagCheckBoxList({
  flags,
  selectedFlags,
  onChange,
}: Props) {
  const handleCheckboxChange = (category: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedFlags, category]);
    } else {
      onChange(selectedFlags.filter((c) => c !== category));
    }
  };

  const selectAll = () => {
    onChange(flags);
  };

  const deselectAll = () => {
    onChange([]);
  };

  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-2">フラグで絞り込み</h4>
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
        {flags.map((category) => (
          <label key={category} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedFlags.includes(category)}
              onChange={(e) => handleCheckboxChange(category, e.target.checked)}
            />
            <span className="text-sm">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
