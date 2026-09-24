"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const events = new EventSource("/api/events");
    events.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { count: number };
        setCount(data.count);
      } catch {
        // ignore malformed events
      }
    };
    return () => events.close();
  }, []);

  async function updateCount(method: "POST" | "DELETE") {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/count", { method });
      const data = (await response.json()) as { count: number };
      setCount(data.count);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="max-w-md text-center text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        Cringe-Counter von Jack
      </h1>
      <Image
        src="/IMG_5573.PNG"
        alt="Jack"
        width={1179}
        height={2556}
        sizes="12rem"
        loading="eager"
        className="mt-10 h-auto w-48 rounded-2xl shadow-lg"
      />
      <p className="mt-12 text-[7rem] font-bold leading-none tabular-nums text-zinc-50 sm:text-[9rem]">
        {count}
      </p>
      <button
        type="button"
        onClick={() => updateCount("POST")}
        disabled={busy}
        className="mt-12 rounded-full bg-rose-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
      >
        cringe
      </button>
      <button
        type="button"
        onClick={() => updateCount("DELETE")}
        disabled={busy}
        aria-label="Counter verringern"
        className="mt-6 text-xs text-zinc-700 transition hover:text-zinc-500 disabled:opacity-60"
      >
        −1
      </button>
    </main>
  );
}
