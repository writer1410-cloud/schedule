import { NextResponse } from "next/server";
import { bookingInput } from "@/lib/validators";
import { createBooking, BookingError } from "@/lib/bookings";

// 公開: 予約作成
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const parsed = bookingInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 },
    );
  }

  try {
    const booking = await createBooking(parsed.data);
    return NextResponse.json(
      { code: booking.code, startAt: booking.startAt },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof BookingError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error("[POST /api/bookings]", e);
    return NextResponse.json(
      { error: "予約処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
