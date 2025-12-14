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
    <div className="p-4">
      <h2 className="text-2xl font-bold">
        ito - お題一覧
        {/* バージョン管理(手動) */}
        <span className="font-medium pl-4 text-xl text-gray-400">v0.1</span>
      </h2>

      {/* --- 黒板 --- */}
      <div className="relative w-full h-[340px] text-white">
        <img
          src="/images/黒板.png"
          alt="黒板"
          className="absolute inset-0 w-full h-full"
        />

        <div className="">
          {/* お題 */}
          <div className="absolute top-20 left-16 text-3xl font-bold">お題</div>

          {/* #タグ */}
          <div className="absolute top-40 left-16 text-xl font-bold">
            ＃タグ
          </div>

          {/* 制作者・フラグ・表示／総数 */}
          <div className="absolute top-60 left-20 flex items-center gap-6">
            <div className="text-xl font-bold">制作者</div>
            <div className="text-xl font-bold">フラグ</div>
            <div className="text-xl font-bold">表示／総数</div>
          </div>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-auto mb-[80px]">
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
