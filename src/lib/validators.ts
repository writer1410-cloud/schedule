import { z } from "zod";

export const bookingInput = z.object({
  serviceId: z.string().min(1, "サービスを選択してください"),
  startIso: z.string().datetime({ message: "日時の形式が不正です" }),
  customerName: z.string().min(1, "お名前を入力してください").max(100),
  customerEmail: z.string().email("メールアドレスの形式が不正です"),
  customerPhone: z.string().max(30).optional().or(z.literal("")),
  carModel: z.string().max(100).optional().or(z.literal("")),
  carPlate: z.string().max(30).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});
export type BookingInput = z.infer<typeof bookingInput>;

export const waitlistInput = z.object({
  serviceId: z.string().min(1, "サービスを選択してください"),
  desiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "希望日を選択してください"),
  customerName: z.string().min(1, "お名前を入力してください").max(100),
  customerEmail: z.string().email("メールアドレスの形式が不正です"),
  customerPhone: z.string().max(30).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});
export type WaitlistInput = z.infer<typeof waitlistInput>;
