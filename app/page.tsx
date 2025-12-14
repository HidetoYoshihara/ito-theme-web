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

import ItemsTable from "@/components/ItemsTable";
import Blackboard from "@/components/Blackboard";

// アプリ更新時は手動で数値を変更してください！
const APP_VAR = "0.0.4";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec";

// 🔹 行データの型を明示
export type Item = {
  title: string;
  category: string;
  level: string;
  notes: string;
  extra: string;
};

// // 表示順・対応列
// const headerMap: (keyof Item)[] = [
//   "title",
//   "category",
//   "level",
//   "notes",
//   "extra",
// ];

export default async function Page() {
  let items: Item[] = [];
  let header: string[] = [];
  // let displayHeader: string[] = [];
  let displayHeader: Item[] = [];

  try {
    const res = await fetch(GAS_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();
    const rowsData = data.slice(1) || [];

    // 1行目（ヘッダー）※ 2〜6列目
    const headerRow = data[0] ?? [];

    displayHeader = [
      {
        title: headerRow[2] ?? "",
        category: headerRow[3] ?? "",
        level: headerRow[4] ?? "",
        notes: headerRow[5] ?? "",
        extra: headerRow[6] ?? "",
      },
    ];

    items = rowsData
      .filter((row: any[]) => row[2] !== "")
      .map((row: any[]) => ({
        title: row[2] ?? "",
        category: row[3] ?? "",
        level: row[4] ?? "",
        notes: row[5] ?? "",
        extra: row[6] ?? "",
      }));

    console.log("items", items);
  } catch (err) {
    console.error("データ取得エラー:", err);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">
        ito - お題一覧
        <span className="font-medium pl-4 text-xl text-gray-400">
          v{APP_VAR}
        </span>
      </h2>

      <Blackboard />

      <ItemsTable header={displayHeader} rows={items} />
    </div>
  );
}
