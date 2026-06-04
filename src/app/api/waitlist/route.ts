import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { waitlistInput } from "@/lib/validators";
import { dayStartUtc } from "@/lib/time";

// 公開: キャンセル待ち登録
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const parsed = waitlistInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: d.serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "サービスが見つかりません" }, { status: 400 });
  }

  const entry = await prisma.waitlistEntry.create({
    data: {
      serviceId: d.serviceId,
      customerName: d.customerName,
      customerEmail: d.customerEmail,
      customerPhone: d.customerPhone || null,
      note: d.note || null,
      desiredDate: dayStartUtc(d.desiredDate),
      status: "WAITING",
    },
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
