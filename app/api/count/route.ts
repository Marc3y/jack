import { decrementCount, getCount, incrementCount } from "@/lib/counter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({ count: await getCount() });
}

export async function POST() {
  const count = await incrementCount();
  return Response.json({ count });
}

export async function DELETE() {
  const count = await decrementCount();
  return Response.json({ count });
}
