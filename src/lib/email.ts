import nodemailer from "nodemailer";
import { config } from "./config";

export type Mail = {
  to: string;
  subject: string;
  text: string;
};

/**
 * メール送信の抽象化。
 * - MAIL_DRIVER=console: 実送信せずコンソールに出力（開発・デモ用デフォルト）
 * - MAIL_DRIVER=smtp:    SMTP 設定を使って実送信
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (config.mail.driver === "smtp" && config.mail.smtp.host) {
    const transport = nodemailer.createTransport({
      host: config.mail.smtp.host,
      port: config.mail.smtp.port,
      secure: config.mail.smtp.port === 465,
      auth: config.mail.smtp.user
        ? { user: config.mail.smtp.user, pass: config.mail.smtp.pass }
        : undefined,
    });
    await transport.sendMail({
      from: config.mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    });
    return;
  }

  // console ドライバ
  console.log(
    [
      "",
      "========== [MAIL] ==========",
      `From: ${config.mail.from}`,
      `To:   ${mail.to}`,
      `Subj: ${mail.subject}`,
      "----------------------------",
      mail.text,
      "============================",
      "",
    ].join("\n"),
  );
}
