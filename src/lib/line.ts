import crypto from "crypto";
import { config } from "./config";

const LINE_API = "https://api.line.me";

/** Messaging API（push / 返信）が使える設定になっているか */
export function isLineMessagingConfigured(): boolean {
  return Boolean(config.line.channelAccessToken);
}

/** LIFF（LINE 内予約）が使える設定になっているか */
export function isLiffConfigured(): boolean {
  return Boolean(config.line.liffId && config.line.loginChannelId);
}

/**
 * 予約画面への入口URL。
 * LIFF が設定済みなら LIFF URL（LINE内で開くと ID トークンが取れ、ユーザーと紐付く）。
 * 未設定なら通常の Web URL。
 */
export function bookingEntryUrl(query?: string): string {
  const q = query ? `?${query}` : "";
  if (config.line.liffId) {
    return `https://liff.line.me/${config.line.liffId}${q}`;
  }
  return `${config.appUrl}/book${q}`;
}

type LineMessage =
  | { type: "text"; text: string }
  | Record<string, unknown>;

/** テキスト＋任意のリンクボタンのメッセージを組み立てる */
export function textWithLink(text: string, link?: { label: string; uri: string }) {
  if (!link) return [{ type: "text", text } as LineMessage];
  // ボタン付きテンプレート（リンクを開かせたいとき）
  return [
    {
      type: "template",
      altText: text,
      template: {
        type: "buttons",
        text: text.length > 160 ? text.slice(0, 157) + "…" : text,
        actions: [{ type: "uri", label: link.label, uri: link.uri }],
      },
    } as LineMessage,
  ];
}

/** LINE ユーザーへ push 送信。未設定時は何もしない（メールにフォールバック） */
export async function pushLineMessages(
  to: string,
  messages: LineMessage[],
): Promise<void> {
  if (!isLineMessagingConfigured()) {
    console.log("[line] push skipped (not configured):", to);
    return;
  }
  const res = await fetch(`${LINE_API}/v2/bot/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.line.channelAccessToken}`,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LINE push failed: ${res.status} ${detail}`);
  }
}

/** Webhook の返信トークンで返信する */
export async function replyLineMessages(
  replyToken: string,
  messages: LineMessage[],
): Promise<void> {
  if (!isLineMessagingConfigured()) return;
  const res = await fetch(`${LINE_API}/v2/bot/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.line.channelAccessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[line] reply failed", res.status, detail);
  }
}

/** Webhook 署名検証（X-Line-Signature） */
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  if (!config.line.channelSecret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", config.line.channelSecret)
    .update(rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

export type LiffProfile = { userId: string; displayName?: string };

/** JWT のペイロードから aud（発行チャネルID）を取り出す。失敗時 null */
function decodeAud(idToken: string): string | null {
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const aud = json.aud;
    if (Array.isArray(aud)) return aud[0] ?? null;
    return typeof aud === "string" ? aud : null;
  } catch {
    return null;
  }
}

async function verifyWith(
  idToken: string,
  clientId: string,
): Promise<LiffProfile | null> {
  const res = await fetch(`${LINE_API}/oauth2/v2.1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[line] id token verify failed", res.status, clientId, detail);
    return null;
  }
  const data = (await res.json()) as { sub?: string; name?: string };
  if (!data.sub) return null;
  return { userId: data.sub, displayName: data.name };
}

/**
 * LIFF から渡された ID トークンを LINE のエンドポイントで検証し、
 * ユーザーID（sub）と表示名を取り出す。検証できなければ null。
 * 設定の channel ID が合わない場合は、トークン内の aud で自動リトライする。
 */
export async function verifyLiffIdToken(
  idToken: string,
): Promise<LiffProfile | null> {
  const aud = decodeAud(idToken);
  const configured = config.line.loginChannelId;
  const clientId = configured || aud;
  if (!clientId) {
    console.error("[line] no client_id for id token verify (set LINE_LOGIN_CHANNEL_ID)");
    return null;
  }
  try {
    const result = await verifyWith(idToken, clientId);
    if (result) return result;
    // 設定値で失敗し、トークンの aud が別なら aud でリトライ
    if (aud && aud !== clientId) {
      console.warn("[line] retrying id token verify with token aud", aud);
      return await verifyWith(idToken, aud);
    }
    return null;
  } catch (e) {
    console.error("[line] id token verify error", e);
    return null;
  }
}
