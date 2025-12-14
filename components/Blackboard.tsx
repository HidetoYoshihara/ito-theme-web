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
        src="/images/黒板.png"
        alt="黒板"
        className="absolute inset-0 w-full h-full"
      />

      <div>
        {/* お題 */}
        <div className="absolute top-20 left-16 text-3xl font-bold">
          {topic}
        </div>

        {/* #タグ */}
        <div className="absolute top-40 left-16 text-xl font-bold">{tags}</div>

        {/* 制作者・フラグ・表示／総数 */}
        <div className="absolute top-60 left-20 flex items-center gap-6">
          <div className="text-xl font-bold">{creator}</div>
          <div className="text-xl font-bold">{flag}</div>
          <div className="text-xl font-bold">{displayInfo}</div>
        </div>
      </div>
    </div>
  );
}
