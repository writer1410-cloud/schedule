import { config } from "./config";

export type CalendarEvent = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
};

/**
 * Google Calendar 連携の抽象化。
 * - GOOGLE_CALENDAR_DRIVER=noop:   連携せずログ出力のみ（デフォルト）
 * - GOOGLE_CALENDAR_DRIVER=google: 実連携（サービスアカウントが必要）
 *
 * 実連携を有効にする場合は googleapis を導入し、createEvent/deleteEvent の
 * google ブロックを実装する（インターフェースは変更不要）。
 */
export async function createCalendarEvent(
  event: CalendarEvent,
): Promise<string | null> {
  if (config.google.driver === "google" && config.google.calendarId) {
    // TODO: googleapis を用いた実連携。サービスアカウントでカレンダーを共有し、
    //   calendar.events.insert を呼び出してイベントIDを返す。
    console.warn(
      "[google-calendar] driver=google ですが実連携は未実装です。noop と同様に処理します。",
    );
  }

  // noop: 連携せずダミーIDを返す（DB には保持される）
  const id = `noop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(
    `[google-calendar] create event "${event.summary}" ${event.start.toISOString()} -> id=${id}`,
  );
  return id;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (config.google.driver === "google" && config.google.calendarId) {
    // TODO: calendar.events.delete
  }
  console.log(`[google-calendar] delete event id=${eventId}`);
}
