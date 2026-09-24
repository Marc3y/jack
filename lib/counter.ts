import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "count.json");

type Listener = (count: number) => void;

const listeners = new Set<Listener>();
let writeChain = Promise.resolve(0);

function readCount(): number {
  if (!existsSync(file)) return 0;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { count?: number };
    return typeof parsed.count === "number" ? parsed.count : 0;
  } catch {
    return 0;
  }
}

function writeCount(count: number) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ count }));
}

export function getCount() {
  return readCount();
}

function changeCount(delta: number) {
  writeChain = writeChain.then(() => {
    const count = Math.max(0, readCount() + delta);
    writeCount(count);
    for (const listener of listeners) listener(count);
    return count;
  });
  return writeChain;
}

export function incrementCount() {
  return changeCount(1);
}

export function decrementCount() {
  return changeCount(-1);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
