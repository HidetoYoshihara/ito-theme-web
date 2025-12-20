"use client";

type Props = {
  topic?: string;
  tags?: string;
  creator?: string;
  flag?: string;
  displayInfo?: string;
  className?: string;
};

export default function Blackboard({
  topic = "お題",
  tags = "＃タグ",
  creator = "制作者",
  flag = "フラグ",
  displayInfo = "表示／総数",
  className = "",
}: Props) {
  return (
    <div className={`relative w-full h-[340px] text-white ${className}`}>
      <img
        src="/images/スピーカー.png"
        alt="スピーカー"
        className="absolute top-[-66px] left-1/2 -translate-x-1/2 w-[120px]"
      />

      <img
        src="/images/黒板.png"
        alt="黒板"
        className="absolute inset-0 w-full h-full"
      />

      <img
        src="/images/黒板けし.png"
        alt="黒板けし"
        className="absolute bottom-[24px] right-[180px] h-[50px]"
      />

      <img
        src="/images/チョーク白.png"
        alt="チョーク白"
        className="absolute bottom-[30px] right-[500px] h-[20px]"
      />

      <img
        src="/images/チョーク赤.png"
        alt="チョーク赤"
        className="absolute bottom-[29px] right-[420px] h-[20px]"
      />

      <img
        src="/images/文字.png"
        alt="文字"
        className="absolute bottom-[20px] right-[50px] w-[36px] opacity-85"
      />

      {/* お題 */}
      <div className="absolute top-[18%] left-[6%] text-3xl font-bold">
        {topic}
      </div>

      {/* #タグ */}
      <div className="absolute top-[38%] left-[6%] text-xl font-bold">
        {tags}
      </div>

      {/* 制作者・フラグ・表示／総数 */}
      <div className="absolute top-[60%] left-[12%] flex items-center gap-6">
        <div className="text-xl font-bold">{creator}</div>
        <div className="text-xl font-bold">{flag}</div>
        <div className="text-xl font-bold">{displayInfo}</div>
      </div>
    </div>
  );
}
