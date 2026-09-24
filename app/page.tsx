import { Counter } from "./counter";
import { getCount } from "@/lib/counter";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <Counter initialCount={await getCount()} />;
}
