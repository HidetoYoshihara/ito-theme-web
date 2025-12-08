// https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="bg flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <div className="text-green-500 ">やよい</div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

export default function App() {
  const [header, setHeader] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec"
        );
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        console.log("GASからのデータ:", data);

        // 1行目（ヘッダー）
        const headerRow = data[0];
        setHeader(headerRow);

        // データ本体（2行目以降）
        const extracted = data
          .slice(1)
          .filter((row: any[]) => row[2] !== "") // 3列目が空白なら除外
          .map((row: any[]) => row.slice(2, 7)); // 3〜7列目だけ抽出

        setRows(extracted);
      } catch (err) {
        console.error("エラー:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ito - お題一覧</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-sky-800 text-white">
              <th className="border border-gray-300 px-4 py-2">No</th>

              {header.slice(2, 7).map((h, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 font-semibold"
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
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-3 py-1"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
