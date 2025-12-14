"use client";

type Props = {
  header: string[];
  rows: any[][];
};

export default function ItemsTable({ header, rows }: Props) {
  console.log("header", header);
  console.log("rows", rows);

  return (
    <div className="max-h-[500px] overflow-auto mb-[80px]">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          <tr>
            <th className="sticky top-0 z-10 bg-sky-800 text-white border border-gray-300 px-4 py-2">
              No
            </th>
            {header.slice(2, 7).map((h, index) => (
              <th
                key={index}
                className="sticky top-0 z-10 bg-sky-800 text-white border border-gray-300 px-4 py-2 font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <td className="border border-gray-300 px-3 py-1 font-medium">
                {rowIndex + 1}
              </td>

              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-gray-300 px-3 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
