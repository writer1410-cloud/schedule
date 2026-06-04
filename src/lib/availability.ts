import { prisma } from "./db";
import {
  wallTimeToUtc,
  dayStartUtc,
  weekdayInTz,
  formatTime,
} from "./time";
import { addMinutes } from "date-fns";

export type Slot = {
  /** 枠の開始時刻（UTC ISO） */
  startIso: string;
  /** "14:30" 表示用 */
  label: string;
  available: boolean;
  /** 残り受付可能数 */
  remaining: number;
};

export type AvailabilityResult = {
  date: string;
  open: boolean;
  reason?: string;
  slots: Slot[];
};

/** 同一店舗の予約占有とみなすステータス */
const OCCUPYING = ["PENDING", "CONFIRMED"];

/**
 * 指定サービス・日付の空き枠を算出する。
 * 営業時間・定休日・所要時間・並行受付数（capacity）・既存予約を考慮。
 */
export async function getAvailability(
  serviceId: string,
  dateStr: string,
): Promise<AvailabilityResult> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { date: dateStr, open: false, reason: "サービスが見つかりません", slots: [] };
  }

  const shop = await prisma.shop.findFirst({
    include: { businessHours: true, holidays: true },
  });
  if (!shop) {
    return { date: dateStr, open: false, reason: "店舗が未設定です", slots: [] };
  }

  const dayStart = dayStartUtc(dateStr);

  // 定休日（特定日）チェック
  const isHoliday = shop.holidays.some(
    (h) => h.date.getTime() === dayStart.getTime(),
  );
  if (isHoliday) {
    return { date: dateStr, open: false, reason: "休業日です", slots: [] };
  }

  // 曜日の営業時間
  const weekday = weekdayInTz(dayStart);
  const bh = shop.businessHours.find((b) => b.weekday === weekday);
  if (!bh || bh.isClosed) {
    return { date: dateStr, open: false, reason: "定休日です", slots: [] };
  }

  // その日の予約を取得（占有判定用）
  const dayEnd = addMinutes(dayStart, 24 * 60);
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: OCCUPYING },
      startAt: { gte: dayStart, lt: dayEnd },
    },
    select: { startAt: true, endAt: true },
  });

  const now = new Date();
  const slots: Slot[] = [];

  // open から (close - 所要時間) まで slotInterval 刻みで候補生成
  for (
    let m = bh.openMin;
    m + service.durationMin <= bh.closeMin;
    m += shop.slotInterval
  ) {
    const start = wallTimeToUtc(dateStr, m);
    const end = addMinutes(start, service.durationMin);

    // 過去枠は除外
    if (start <= now) continue;

    // この枠と時間が重なる既存予約数
    const overlapping = bookings.filter(
      (b) => b.startAt < end && b.endAt > start,
    ).length;

    const remaining = Math.max(0, shop.capacity - overlapping);
    slots.push({
      startIso: start.toISOString(),
      label: formatTime(start),
      available: remaining > 0,
      remaining,
    });
  }

  return { date: dateStr, open: true, slots };
}

/**
 * 予約作成直前の最終チェック（競合・営業時間内かを再検証）。
 * 戻り値が null なら予約可能、文字列ならエラー理由。
 */
export async function validateBookingSlot(
  serviceId: string,
  startAt: Date,
): Promise<string | null> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return "サービスが見つかりません";

  const shop = await prisma.shop.findFirst({
    include: { businessHours: true, holidays: true },
  });
  if (!shop) return "店舗が未設定です";

  if (startAt <= new Date()) return "過去の日時は予約できません";

  const end = addMinutes(startAt, service.durationMin);

  // 占有数チェック
  const overlapping = await prisma.booking.count({
    where: {
      status: { in: OCCUPYING },
      startAt: { lt: end },
      endAt: { gt: startAt },
    },
  });
  if (overlapping >= shop.capacity) {
    return "選択された枠は満席になりました。別の時間をお選びください";
  }

  return null;
}
