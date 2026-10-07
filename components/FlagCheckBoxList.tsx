"use client";

import React from "react";

import FilterCheckbox from "./FilterCheckbox";

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
  const formatLabel = (flag: string) => (flag.trim() === "" ? "”空白”" : flag);

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

  return (
    <div className="z-10 mb-4 flex flex-col items-center">
      <div className="w-[1000px]">
        <h4 className="mb-2 text-base font-semibold text-slate-800">
          フラグで絞り込み
        </h4>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-sky-200 bg-sky-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
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
          {flags.map((flag) => (
            <FilterCheckbox
              key={flag || "empty-flag"}
              checked={selectedFlags.includes(flag)}
              onChange={(checked) => handleCheckboxChange(flag, checked)}
              label={formatLabel(flag)}
              className="min-w-[120px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
