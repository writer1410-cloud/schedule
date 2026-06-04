import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { sendDueReminders } from "@/lib/bookings";

// 前日リマインド一括送信エンドポイント。
// Cron（Vercel Cron / GitHub Actions 等）から Bearer CRON_SECRET で叩く想定。
async function handle(req: Request) {
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const token = auth?.startsWith("Bearer ")
    ? auth.slice(7)
    : url.searchParams.get("secret");

  if (token !== config.cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await sendDueReminders();
  return NextResponse.json({
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
