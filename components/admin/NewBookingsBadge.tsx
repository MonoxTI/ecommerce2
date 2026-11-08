"use client";
// components/admin/NewBookingsBadge.tsx
// Small count pill for the admin sidebar, e.g. next to "Services".
import { useEffect, useState } from "react";

export default function NewBookingsBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/admin/appointments/new", { credentials: "include", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (alive && typeof j?.data?.count === "number") setCount(j.data.count); })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center font-sans"
          title={`${count} new booking${count !== 1 ? "s" : ""}`}>
      {count > 9 ? "9+" : count}
    </span>
  );
}