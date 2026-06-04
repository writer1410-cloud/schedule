import { cookies } from "next/headers";
import { config } from "./config";

const COOKIE_NAME = "admin_token";

/** リクエストヘッダ or Cookie の管理トークンを検証 */
export function isAuthorized(req: Request): boolean {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    if (auth.slice(7) === config.adminToken) return true;
  }
  const header = req.headers.get("x-admin-token");
  if (header && header === config.adminToken) return true;

  // Cookie（管理画面のブラウザアクセス用）
  const cookieToken = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];
  if (cookieToken && decodeURIComponent(cookieToken) === config.adminToken) {
    return true;
  }
  return false;
}

/** サーバーコンポーネント側で Cookie を見てログイン判定 */
export async function isAdminLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === config.adminToken;
}

export { COOKIE_NAME };
