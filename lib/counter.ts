import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

// On Vercel the count lives in Upstash Redis (connected via the Vercel
// Marketplace, which sets one of these env var pairs). Locally it falls back
// to a JSON file.
const redisUrl =
  process.env.JACK_KV_REST_API_URL ??
  process.env.UPSTASH_REDIS_REST_URL ??
  process.env.KV_REST_API_URL;
const redisToken =
  process.env.JACK_KV_REST_API_TOKEN ??
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  process.env.KV_REST_API_TOKEN;

const KEY = "jack:cringe-count";

const DECREMENT_SCRIPT = `
local count = redis.call("DECR", KEYS[1])
if count < 0 then
  redis.call("SET", KEYS[1], 0)
  count = 0
end
return count`;

async function redis(command: (string | number)[]): Promise<unknown> {
  const response = await fetch(redisUrl!, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await response.json()) as { result?: unknown; error?: string };
  if (!response.ok || data.error) {
    throw new Error(`Redis error: ${data.error ?? response.status}`);
  }
  return data.result;
}

// Vercel's filesystem is read-only except for /tmp, which is not shared
// between instances — good enough to avoid crashing, but not persistent.
const file = process.env.VERCEL
  ? path.join(os.tmpdir(), "count.json")
  : path.join(process.cwd(), "data", "count.json");

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

function changeFileCount(delta: number) {
  writeChain = writeChain.then(() => {
    const count = Math.max(0, readCount() + delta);
    writeCount(count);
    return count;
  });
  return writeChain;
}

export async function getCount() {
  if (redisUrl && redisToken) return Number((await redis(["GET", KEY])) ?? 0);
  return readCount();
}

export async function incrementCount() {
  if (redisUrl && redisToken) return Number(await redis(["INCR", KEY]));
  return changeFileCount(1);
}

export async function decrementCount() {
  if (redisUrl && redisToken) {
    return Number(await redis(["EVAL", DECREMENT_SCRIPT, 1, KEY]));
  }
  return changeFileCount(-1);
}
