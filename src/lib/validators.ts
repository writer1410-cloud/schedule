import { z } from "zod";

export const bookingInput = z.object({
  serviceId: z.string().min(1, "サービスを選択してください"),
  startIso: z.string().datetime({ message: "日時の形式が不正です" }),
  customerName: z.string().min(1, "お名前を入力してください").max(100),
  customerEmail: z.string().email("メールアドレスの形式が不正です"),
  customerPhone: z.string().max(30).optional().or(z.literal("")),
  // 業種ごとの追加入力欄1・2（preset の customFields でラベルを設定）
  carModel: z.string().max(100).optional().or(z.literal("")),
  carPlate: z.string().max(100).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
  // LIFF（LINE 内予約）から渡される ID トークン
  lineIdToken: z.string().optional(),
});
export type BookingInput = z.infer<typeof bookingInput>;

export const waitlistInput = z.object({
  serviceId: z.string().min(1, "サービスを選択してください"),
  desiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "希望日を選択してください"),
  customerName: z.string().min(1, "お名前を入力してください").max(100),
  customerEmail: z.string().email("メールアドレスの形式が不正です"),
  customerPhone: z.string().max(30).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
  // LIFF（LINE 内登録）から渡される ID トークン
  lineIdToken: z.string().optional(),
});
export type WaitlistInput = z.infer<typeof waitlistInput>;
