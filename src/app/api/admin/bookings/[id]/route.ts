import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";
import { cancelBooking, BookingError } from "@/lib/bookings";

const VALID = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

// 管理: 予約ステータス変更
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }
  if (!body.status || !VALID.includes(body.status)) {
    return NextResponse.json({ error: "status が不正です" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
  }

  // キャンセルは通知・キャンセル待ち繰上げを伴うので専用処理に委譲
  if (body.status === "CANCELLED") {
    try {
      await cancelBooking(booking.code);
    } catch (e) {
      if (e instanceof BookingError) {
        return NextResponse.json({ error: e.message }, { status: 409 });
      }
      throw e;
    }
    return NextResponse.json({ ok: true, status: "CANCELLED" });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true, status: body.status });
}
