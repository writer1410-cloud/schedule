import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { addMinutes } from "date-fns";
import { ja } from "date-fns/locale";
import { config } from "./config";

const TZ = config.timezone;

/** "2026-06-10" + 540(分) を店舗TZの壁時計として解釈し UTC Date を返す */
export function wallTimeToUtc(dateStr: string, minutesFromMidnight: number): Date {
  const hh = String(Math.floor(minutesFromMidnight / 60)).padStart(2, "0");
  const mm = String(minutesFromMidnight % 60).padStart(2, "0");
  return fromZonedTime(`${dateStr}T${hh}:${mm}:00`, TZ);
}

/** "2026-06-10" の店舗TZ 00:00 を UTC Date で返す */
export function dayStartUtc(dateStr: string): Date {
  return wallTimeToUtc(dateStr, 0);
}

/** Date を店舗TZの "yyyy-MM-dd" 文字列に変換 */
export function toDateStr(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd");
}

/** Date の店舗TZにおける曜日（0=日曜 ... 6=土曜）を返す */
export function weekdayInTz(date: Date): number {
  // 'i' は ISO 曜日 (Mon=1..Sun=7)。% 7 で Sun=0..Sat=6 に変換
  const iso = Number(formatInTimeZone(date, TZ, "i"));
  return iso % 7;
}

/** Date の店舗TZにおける 0:00 からの経過分を返す */
export function minutesOfDay(date: Date): number {
  const h = Number(formatInTimeZone(date, TZ, "H"));
  const m = Number(formatInTimeZone(date, TZ, "m"));
  return h * 60 + m;
}

/** 表示用フォーマット（日本語ロケール） */
export function formatJa(date: Date, fmt: string): string {
  return formatInTimeZone(date, TZ, fmt, { locale: ja });
}

/** "6月10日(火) 14:30" のような見やすい表記 */
export function formatHuman(date: Date): string {
  return formatJa(date, "M月d日(E) HH:mm");
}

export function formatDateHuman(date: Date): string {
  return formatJa(date, "yyyy年M月d日(E)");
}

export function formatTime(date: Date): string {
  return formatJa(date, "HH:mm");
}

export { addMinutes, toZonedTime };
