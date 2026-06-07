import { prisma } from "./db";
import { generateBookingCode } from "./code";
import { validateBookingSlot } from "./availability";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "./google-calendar";
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendReminder,
  sendWaitlistOpening,
} from "./notifications";
import { dayStartUtc, toDateStr, formatHuman } from "./time";
import { verifyLiffIdToken } from "./line";
import { addMinutes } from "date-fns";
import type { BookingInput } from "./validators";

export class BookingError extends Error {}

/** 予約を作成し、カレンダー登録・確認メール／LINE 送信まで行う */
export async function createBooking(input: BookingInput) {
  const startAt = new Date(input.startIso);

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service || !service.active) throw new BookingError("サービスが見つかりません");

  const invalid = await validateBookingSlot(input.serviceId, startAt);
  if (invalid) throw new BookingError(invalid);

  const endAt = addMinutes(startAt, service.durationMin);

  // LIFF 経由なら ID トークンを検証して LINE ユーザーIDを取得（通知先に使う）
  let lineUserId: string | null = null;
  if (input.lineIdToken) {
    const profile = await verifyLiffIdToken(input.lineIdToken);
    lineUserId = profile?.userId ?? null;
    console.log(
      `[booking] line link ${lineUserId ? "ok: " + lineUserId.slice(0, 8) + "…" : "FAILED (id token not verified)"}`,
    );
  }

  // 一意な予約番号を採番（衝突時はリトライ）
  let booking = null;
  for (let attempt = 0; attempt < 5 && !booking; attempt++) {
    const code = generateBookingCode();
    try {
      booking = await prisma.booking.create({
        data: {
          code,
          serviceId: input.serviceId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone || null,
          carModel: input.carModel || null,
          carPlate: input.carPlate || null,
          note: input.note || null,
          lineUserId,
          startAt,
          endAt,
          status: "CONFIRMED",
        },
        include: { service: true },
      });
    } catch (e: unknown) {
      // P2002 = unique 制約違反（code 衝突）。リトライ
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }
  if (!booking) throw new BookingError("予約番号の採番に失敗しました。再度お試しください");

  // Google Calendar 連携（失敗しても予約自体は成立させる）
  try {
    const eventId = await createCalendarEvent({
      summary: `${booking.service.name} / ${booking.customerName}`,
      description: [
        `予約番号: ${booking.code}`,
        `連絡先: ${booking.customerEmail} ${booking.customerPhone ?? ""}`,
        booking.carModel ? `車種: ${booking.carModel}` : "",
        booking.note ? `備考: ${booking.note}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: booking.startAt,
      end: booking.endAt,
    });
    if (eventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: eventId },
      });
    }
  } catch (e) {
    console.error("[booking] calendar sync failed", e);
  }

  // 確認メール（失敗しても予約は成立）
  try {
    await sendBookingConfirmation(booking);
  } catch (e) {
    console.error("[booking] confirmation mail failed", e);
  }

  return booking;
}

/** 予約をキャンセルし、カレンダー削除・通知・キャンセル待ち繰上げを行う */
export async function cancelBooking(code: string) {
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { service: true },
  });
  if (!booking) throw new BookingError("予約が見つかりません");
  if (booking.status === "CANCELLED") return booking;
  if (booking.status === "COMPLETED")
    throw new BookingError("完了済みの予約はキャンセルできません");

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
    include: { service: true },
  });

  if (booking.googleEventId) {
    try {
      await deleteCalendarEvent(booking.googleEventId);
    } catch (e) {
      console.error("[booking] calendar delete failed", e);
    }
  }

  try {
    await sendBookingCancellation(updated);
  } catch (e) {
    console.error("[booking] cancellation mail failed", e);
  }

  // 空きが出たのでキャンセル待ちを繰り上げ通知
  try {
    await notifyWaitlistForOpening(booking.serviceId, toDateStr(booking.startAt));
  } catch (e) {
    console.error("[booking] waitlist notify failed", e);
  }

  return updated;
}

/**
 * 指定サービス・日付に空きが出た際、キャンセル待ちの最も古い WAITING を通知する。
 */
export async function notifyWaitlistForOpening(serviceId: string, dateStr: string) {
  const desiredDate = dayStartUtc(dateStr);
  const entry = await prisma.waitlistEntry.findFirst({
    where: { serviceId, desiredDate, status: "WAITING" },
    orderBy: { createdAt: "asc" },
    include: { service: true },
  });
  if (!entry) return null;

  await sendWaitlistOpening(entry);
  await prisma.waitlistEntry.update({
    where: { id: entry.id },
    data: { status: "NOTIFIED", notifiedAt: new Date() },
  });
  return entry;
}

/**
 * 「予約日の前日」に該当する未送信の予約へリマインドメールを送る。
 * Cron / スクリプトから日次で実行する想定。
 */
export async function sendDueReminders(now = new Date()) {
  // 店舗TZの「明日」の 0:00〜翌0:00
  const todayStr = toDateStr(now);
  const todayStart = dayStartUtc(todayStr);
  const tomorrowStart = addMinutes(todayStart, 24 * 60);
  const dayAfterStart = addMinutes(tomorrowStart, 24 * 60);

  const due = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      reminderSentAt: null,
      startAt: { gte: tomorrowStart, lt: dayAfterStart },
    },
    include: { service: true },
  });

  const results: { code: string; ok: boolean }[] = [];
  for (const b of due) {
    try {
      await sendReminder(b);
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSentAt: new Date() },
      });
      results.push({ code: b.code, ok: true });
      console.log(`[reminder] sent ${b.code} (${formatHuman(b.startAt)})`);
    } catch (e) {
      console.error(`[reminder] failed ${b.code}`, e);
      results.push({ code: b.code, ok: false });
    }
  }
  return results;
}
