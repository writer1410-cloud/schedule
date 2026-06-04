import type { Booking, Service, WaitlistEntry } from "@prisma/client";
import { sendMail } from "./email";
import { config } from "./config";
import { formatHuman, formatDateHuman, toDateStr } from "./time";

type BookingWithService = Booking & { service: Service };

/** 予約確定メール */
export async function sendBookingConfirmation(b: BookingWithService) {
  const lines = [
    `${b.customerName} 様`,
    "",
    "ご予約ありがとうございます。下記の内容で受け付けました。",
    "",
    `■ 予約番号: ${b.code}`,
    `■ メニュー : ${b.service.name}`,
    `■ 日時     : ${formatHuman(b.startAt)} 〜 ${formatHuman(b.endAt).split(" ")[1]}`,
    b.carModel ? `■ 車種     : ${b.carModel}` : "",
    "",
    `予約内容の確認・キャンセルはこちら:`,
    `${config.appUrl}/booking/${b.code}`,
    "",
    "ご来店をお待ちしております。",
  ].filter(Boolean);

  await sendMail({
    to: b.customerEmail,
    subject: `【予約確定】${b.service.name} ${formatHuman(b.startAt)}（${b.code}）`,
    text: lines.join("\n"),
  });
}

/** キャンセル完了メール */
export async function sendBookingCancellation(b: BookingWithService) {
  const lines = [
    `${b.customerName} 様`,
    "",
    "下記のご予約をキャンセルしました。",
    "",
    `■ 予約番号: ${b.code}`,
    `■ メニュー : ${b.service.name}`,
    `■ 日時     : ${formatHuman(b.startAt)}`,
    "",
    "またのご利用をお待ちしております。",
  ];
  await sendMail({
    to: b.customerEmail,
    subject: `【キャンセル完了】${b.service.name}（${b.code}）`,
    text: lines.join("\n"),
  });
}

/** 前日リマインドメール */
export async function sendReminder(b: BookingWithService) {
  const lines = [
    `${b.customerName} 様`,
    "",
    "ご予約日が近づいてまいりましたのでお知らせします。",
    "",
    `■ 予約番号: ${b.code}`,
    `■ メニュー : ${b.service.name}`,
    `■ 日時     : ${formatHuman(b.startAt)}`,
    b.carModel ? `■ 車種     : ${b.carModel}` : "",
    "",
    `ご都合が悪くなった場合はこちらからキャンセルをお願いします:`,
    `${config.appUrl}/booking/${b.code}`,
    "",
    "ご来店をお待ちしております。",
  ].filter(Boolean);

  await sendMail({
    to: b.customerEmail,
    subject: `【ご予約前日のお知らせ】${formatHuman(b.startAt)}（${b.code}）`,
    text: lines.join("\n"),
  });
}

/** キャンセル待ちへの空き通知メール */
export async function sendWaitlistOpening(
  w: WaitlistEntry & { service: Service },
) {
  const lines = [
    `${w.customerName} 様`,
    "",
    `キャンセル待ちにご登録いただいていた下記の希望日に空きが出ました。`,
    "",
    `■ メニュー : ${w.service.name}`,
    `■ 希望日   : ${formatDateHuman(w.desiredDate)}`,
    "",
    "下記より予約をお取りください（先着順のため、お早めに）:",
    `${config.appUrl}/book?serviceId=${w.serviceId}&date=${toDateStr(w.desiredDate)}`,
  ];
  await sendMail({
    to: w.customerEmail,
    subject: `【空き枠のお知らせ】${w.service.name} ${formatDateHuman(w.desiredDate)}`,
    text: lines.join("\n"),
  });
}
