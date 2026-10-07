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

      <span className="flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-center text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 group-hover:border-sky-300 group-hover:bg-sky-50 group-hover:text-sky-700 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-700 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200">
        {label}
      </span>
    </label>
  );
}
