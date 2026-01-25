"use client";

import React from "react";

type Props = {
  flags: string[];
  selectedFlags: string[];
  onChange: (selected: string[]) => void;
};

export default function FlagCheckBoxList({
  flags,
  selectedFlags,
  onChange,
}: Props) {
  const handleCheckboxChange = (flag: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedFlags, flag]);
    } else {
      onChange(selectedFlags.filter((f) => f !== flag));
    }
  };

  const selectAll = () => {
    onChange(flags);
  };

  const deselectAll = () => {
    onChange([]);
  };

  return (
    <div className="mb-4 flex items-center flex-col">
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
        {flags.map((flag) => (
          <label key={flag} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedFlags.includes(flag)}
              onChange={(e) => handleCheckboxChange(flag, e.target.checked)}
            />
            <span className="text-sm">{flag}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
