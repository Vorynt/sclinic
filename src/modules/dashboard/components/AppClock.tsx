"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function AppClock() {
  const [time, setTime] = useState<string>("00:00");
  const [date, setDate] = useState<string>(new Date().toLocaleDateString());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge
      variant="outline"
      className="flex items-start gap-2 px-4! py-2 justify-center flex-col h-full rounded-none border-0">
      <p className="text-xs leading-3">{date}</p>
      <p className="text-xs leading-3 font-mono tabular-nums">{time}</p>
    </Badge>
  );
}
