import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { COOKIE_NAME } from "@/lib/auth";

// 管理画面ログイン: トークン一致で Cookie を発行
export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (body.token !== config.adminToken) {
    return NextResponse.json({ error: "トークンが違います" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, config.adminToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12時間
  });
  return res;
}

// ログアウト
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
