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
    onChange(flags.filter((flag) => flag.trim() !== "⚠️"));
  };

  const deselectAll = () => {
    onChange([]);
  };

  // console.log({ flags, selectedFlags });
  // console.log(selectedFlags);

  return (
    <div className="z-10 mb-4 flex flex-col items-center">
      <div className="w-[1000px]">
        <h4 className="text-md mb-2 font-semibold">フラグで絞り込み</h4>
        <div className="mb-2 flex gap-2">
          <button
            className="rounded bg-blue-500 px-2 py-1 text-sm text-white"
            onClick={selectAll}
          >
            デフォルト
          </button>
          <button
            className="rounded bg-gray-500 px-2 py-1 text-sm text-white"
            onClick={deselectAll}
          >
            クリア
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
    </div>
  );
}
