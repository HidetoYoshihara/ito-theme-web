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

"use client"; // ←これで Client Component にする

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbwl15ksxGwmGfEC2Wi5-Kl0AydJudkyMxQmdbN2rqSitFcPJ-kg9djZN9jbnOb9-qg-/exec"
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();

        // 元データを data とする（Array[349][10]）
        const themes = data
          .slice(1) // 1行目（index 0）を無視
          .filter((row: any) => row[2] !== "") // 3列目が空でない行だけ
          .map((row: any) => row[2]); // 3列目（お題）を抽出

        console.log("GASからのデータ:", data);
        console.log("お題一覧：", themes);
      } catch (err) {
        console.error("エラー:", err);
      }
    };

    fetchData();
  }, []);

  return <div>GASデータをコンソールで確認</div>;
}
