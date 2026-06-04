import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cancelBooking, BookingError } from "@/lib/bookings";

// 公開: 予約番号で照会
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { service: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}

// 公開: 予約番号でキャンセル（予約番号を知る本人のみが操作できる前提）
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  try {
    const booking = await cancelBooking(code);
    return NextResponse.json({ status: booking.status });
  } catch (e) {
    if (e instanceof BookingError) {
      const status = e.message.includes("見つかりません") ? 404 : 409;
      return NextResponse.json({ error: e.message }, { status });
    }
    console.error("[DELETE /api/bookings/[code]]", e);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}
