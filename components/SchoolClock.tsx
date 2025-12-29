import { useEffect, useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";
import "./SchoolClock.css";

type Props = {
  size?: number;
  className?: string;
};

export default function SchoolClock({ size = 240, className = "" }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`school-clock inline-flex items-center justify-center ${className}`}>
      <Clock value={now} size={size} renderNumbers />
    </div>
  );
}
