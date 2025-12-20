"use client";

type Item = {
  title: string;
  category: string;
  level: string;
  notes: string;
  extra: string;
};

type Props = {
  header: Item[];
  rows: Item[];
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

const Td = ({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) => (
  <td
    className={`whitespace-pre-line border text-[16px] border-gray-300 text-gray-700 px-3 py-1 ${
      bold ? "font-medium" : ""
    }`}
  >
    {children}
  </td>
);

/* ======================
   メインコンポーネント
   ====================== */
export default function ItemsTable({ header, rows }: Props) {
  if (rows.length === 0) return null;

  // items の key を列定義として使う
  const keys = Object.keys(rows[0]) as (keyof Item)[];

  return (
    <div className="max-h-[500px] overflow-auto mb-[80px]">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          {header.map((header, headerIndex) => (
            <tr key={headerIndex}>
              <Th>No</Th>

              <Th>{header.title}</Th>
              {/* <Th>{header.category}</Th> */}
              <Th>{header.level}</Th>
              <Th>{header.notes}</Th>
              <Th>{header.extra}</Th>
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <Td bold>{rowIndex + 1}</Td>

              <Td>{row.title}</Td>
              {/* <Td>{row.category}</Td> */}
              <Td>{row.level}</Td>
              <Td>{row.notes}</Td>
              <Td>{row.extra}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="py-3 text-gray-500 flex justify-center">— End —</p>
    </div>
  );
}
