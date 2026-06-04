import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { sendDueReminders } from "@/lib/bookings";

// 管理: 前日リマインドを手動実行（動作確認用）
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await sendDueReminders();
  return NextResponse.json({ sent: results.filter((r) => r.ok).length });
}
