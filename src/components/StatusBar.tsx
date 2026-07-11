import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

export default function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#051126]/40 backdrop-blur-md px-6 py-2 flex justify-between items-center text-white/80 text-[11px] font-medium tracking-tight border-b border-white/5 z-40 select-none">
      {/* Time */}
      <span className="font-semibold tabular-nums">{time || "12:58 PM"}</span>

      {/* Dynamic Notch/Speaker slot just for premium look, if on mobile */}
      <div className="hidden sm:block w-20 h-4 bg-black/60 rounded-full border border-white/5 absolute left-1/2 -translate-x-1/2 top-1.5" />

      {/* Icons */}
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5 stroke-[2]" />
        <Wifi className="w-3.5 h-3.5 stroke-[2]" />
        <div className="flex items-center gap-0.5">
          <Battery className="w-4 h-4 stroke-[2] rotate-0" />
          <span className="text-[9px] font-bold">100%</span>
        </div>
      </div>
    </div>
  );
}
