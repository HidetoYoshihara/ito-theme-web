"use client";

import React from "react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
};

export default function FilterCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: Props) {
  return (
    <label
      className={`group inline-flex cursor-pointer items-center ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        className="
          flex min-w-[120px] items-center justify-center rounded-full
          px-3 py-1.5 text-sm font-medium whitespace-nowrap
          shadow-sm transition-all duration-150

          /* OFF（全体を薄く） */
          opacity-60

          /* HOVER（少し濃く） */
          group-hover:opacity-80

          /* ON（完全表示） */
          peer-checked:opacity-100

          /* 色や背景はそのまま */
          text-slate-400 bg-slate-50 border border-slate-200
          group-hover:border-sky-300 group-hover:bg-sky-50 group-hover:text-sky-600
          peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700

          /* FOCUS */
          peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200
        "
      >
        {label}
      </span>
    </label>
  );
}
