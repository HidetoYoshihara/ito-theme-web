import Clock from "react-clock";
import "react-clock/dist/Clock.css";

export default function SchoolClock() {
  return (
    <Clock
      value={new Date()}   // ← 現実の時間
      size={280}
      renderNumbers={true}
      secondHandWidth={2}
      hourHandWidth={6}
      minuteHandWidth={4}
    />
  );
}
