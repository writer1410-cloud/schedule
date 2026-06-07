import { NextResponse } from "next/server";
import {
  verifyLineSignature,
  replyLineMessages,
  textWithLink,
  bookingEntryUrl,
} from "@/lib/line";
import { SHOP } from "@/lib/shop";

export const dynamic = "force-dynamic";

type LineEvent = {
  type: string;
  replyToken?: string;
  message?: { type: string; text?: string };
};

// LINE内で開くと LIFF として起動し、予約とLINEユーザーが紐づく
const bookUrl = () => bookingEntryUrl();

// LINE プラットフォームからの Webhook 受信
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  let body: { events?: LineEvent[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  for (const ev of body.events ?? []) {
    try {
      if (ev.type === "follow" && ev.replyToken) {
        // 友だち追加時のあいさつ
        await replyLineMessages(
          ev.replyToken,
          textWithLink(
            `${SHOP.name}の公式LINEです🚗\n車検・点検・修理のご予約は下のボタンからどうぞ。`,
            { label: "予約する", uri: bookUrl() },
          ),
        );
      } else if (ev.type === "message" && ev.replyToken) {
        // メッセージには予約導線を案内
        await replyLineMessages(
          ev.replyToken,
          textWithLink(
            "ご予約・空き状況の確認は下のボタンから。お電話でも承ります（" +
              SHOP.phone +
              "）。",
            { label: "予約する", uri: bookUrl() },
          ),
        );
      }
    } catch (e) {
      console.error("[line webhook] handler error", e);
    }
  }

  // LINE には常に 200 を返す
  return NextResponse.json({ ok: true });
}

// 動作確認用
export async function GET() {
  return NextResponse.json({ ok: true });
}
