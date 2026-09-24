import { Counter } from "./counter";
import { getCount } from "@/lib/counter";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Counter initialCount={getCount()} />;
}
