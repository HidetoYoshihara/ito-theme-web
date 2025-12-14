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
// "A.B.C" → A：(MAJOR)破壊的変更 B：(MINOR)機能追加 C：(PATCH)バグ修正
const APP_VAR = "0.0.3";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec";

export default async function Page() {
  // サーバーコンポーネントでfetch（初期表示はここで完結）
  let header: string[] = [];
  let rows: any[][] = [];

  try {
    const res = await fetch(GAS_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    // console.log("form-ito-api-data:", data);

    // 1行目（ヘッダー）
    header = data[0] ?? [];

    // データ本体（2行目以降）
    rows = (data.slice(1) || [])
      .filter((row: any[]) => row[2] !== "") // 3列目が空白なら除外
      .map((row: any[]) => row.slice(2, 7)); // 3〜7列目だけ抽出
  } catch (err) {
    // サーバー側ログ
    console.error("データ取得エラー:", err);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">
        ito - お題一覧
        {/* バージョン管理(手動) */}
        <span className="font-medium pl-4 text-xl text-gray-400">
          v{APP_VAR}
        </span>
      </h2>

      {/* --- 黒板 --- */}
      <Blackboard />

      {/* お代一覧テーブル */}
      <ItemsTable header={header} rows={rows} />
    </div>
  );
}
