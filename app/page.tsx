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

import BoardManager from "@/components/BoardManager";
import ItemsTable from "@/components/ItemsTable";
import packageJson from "../package.json";

const APP_VAR = packageJson.version; // アプリのバージョンは package.json から取得

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec";

// 🔹 行データの型を明示
export type Item = {
  id: number;
  title: string;
  flag: string;
  contentType: string;
  creator: string;
  tag: string;
};

export default async function Page() {
  let items: Item[] = [];
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
        id: 0,
        title: headerRow[2] ?? "",
        flag: headerRow[3] ?? "",
        contentType: headerRow[4] ?? "",
        creator: headerRow[5] ?? "",
        tag: headerRow[6] ?? "",
      },
    ];

    items = rowsData
      .filter((row: any[]) => row[2] !== "")
      .map((row: any[], idx: number) => ({
        // スプレッド側のカラムが変更された場合は、ここを修正する！
        id: idx,
        title: row[2] ?? "",
        flag: row[3] ?? "",
        contentType: row[4] ?? "",
        creator: row[5] ?? "",
        tag: row[6] ?? "",

        // ◎old
        // id: idx,
        // title: row[2] ?? "",
        // category: row[3] ?? "",
        // level: row[4] ?? "",
        // notes: row[5] ?? "",
        // extra: row[6] ?? "",
      }));

    // console.log("items", items);
    // console.log("data", data);
  } catch (err) {
    console.error("データ取得エラー:", err);
  }

  return (
    <div className="bg-[#e9e9de] p-4">
      <h2 className="absolute top-1 left-3">
        <span className="text-[14px] font-bold text-gray-600">
          ito - お題一覧
        </span>
        <span className="pl-4 text-[12px] font-medium text-gray-400">
          v{APP_VAR}
        </span>
      </h2>

      <div className="pb-[50px]"></div>

      <BoardManager header={displayHeader[0]} items={items} />
    </div>
  );
}
