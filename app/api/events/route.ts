import { getCount, subscribe } from "@/lib/counter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const send = (count: number) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ count })}\n\n`),
        );
      };

      send(getCount());
      const unsubscribe = subscribe(send);

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(ping);
          unsubscribe();
        }
      }, 15000);

      const close = () => {
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
