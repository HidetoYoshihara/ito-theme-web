"use client";

import type { Item } from "@/app/page";

type Props = {
  header: Item[];
  rows: Item[];
  onSelect?: (item: Item) => void;
};

/* ======================
   小コンポーネント群
   ====================== */
const Th = ({ children }: { children: React.ReactNode }) => (
  // 背景：#b6edf7   色：#004975
  <th className="sticky top-0 z-10 bg-sky-200 text-sky-900 border border-gray-300 px-4 py-2">
    {children}
  </th>
);

type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
  bold?: boolean;
};
const Td = ({ children, bold = false, className = "", ...rest }: TdProps) => (
  <td
    {...rest}
    className={`whitespace-pre-line border text-[16px] border-gray-300 text-gray-700 px-3 py-1 ${
      bold ? "font-medium" : ""
    } ${className}`}
  >
    {children}
  </td>
);

/* ======================
   メインコンポーネント
   ====================== */
export default function ItemsTable({ header, rows, onSelect }: Props) {
  if (rows.length === 0) return null;

  // items の key を列定義として使う
  const keys = Object.keys(rows[0]) as (keyof Item)[];

  return (
    <div className="max-h-[600px] overflow-auto mb-[50px]">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          {header.map((header, headerIndex) => (
            <tr key={headerIndex}>
              <Th>No</Th>

              <Th>{header.title}</Th>
              <Th>{header.flag}</Th>
              <Th>{header.ContentType}</Th>
              <Th>{header.creator}</Th>
              <Th>{header.tag}</Th>
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <Td
                bold
                onClick={() => onSelect?.(row)}
                onKeyDown={(e) => {
                  const k = (e as React.KeyboardEvent).key;
                  if (k === "Enter" || k === " " || k === "Space") {
                    e.preventDefault();
                    onSelect?.(row);
                  }
                }}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                className="text-blue-600! underline cursor-pointer text-center"
              >
                {rowIndex + 1}
              </Td>

              <Td>{row.title}</Td>
              <Td>{row.flag}</Td>
              <Td>{row.ContentType}</Td>
              <Td>{row.creator}</Td>
              <Td>{row.tag}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="py-3 text-gray-500 flex justify-center">— End —</p>
    </div>
  );
}
