import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";

// 公開: 指定サービス・日付の空き枠
// GET /api/availability?serviceId=xxx&date=2026-06-10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId と date は必須です" },
      { status: 400 },
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date の形式が不正です" }, { status: 400 });
  }

  const result = await getAvailability(serviceId, date);
  return NextResponse.json(result);
}
