// 環境変数を 1 箇所に集約。未設定時は開発向けの安全なデフォルトを返す。

export const config = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  timezone: process.env.TIMEZONE ?? "Asia/Tokyo",
  adminToken: process.env.ADMIN_TOKEN ?? "dev-admin-token",
  cronSecret: process.env.CRON_SECRET ?? "dev-cron-secret",
  mail: {
    driver: (process.env.MAIL_DRIVER ?? "console") as "console" | "smtp",
    from: process.env.MAIL_FROM ?? "予約システム <noreply@example.com>",
    smtp: {
      host: process.env.SMTP_HOST ?? "",
      port: Number(process.env.SMTP_PORT ?? "587"),
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  },
  google: {
    driver: (process.env.GOOGLE_CALENDAR_DRIVER ?? "noop") as "noop" | "google",
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? "",
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "",
  },
  line: {
    // Messaging API（push 通知・Webhook 用）
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
    channelSecret: process.env.LINE_CHANNEL_SECRET ?? "",
    // LIFF（LINE 内で予約画面を開く）。ID トークン検証に使うチャネルID
    liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "",
    loginChannelId: process.env.LINE_LOGIN_CHANNEL_ID ?? "",
  },
};
