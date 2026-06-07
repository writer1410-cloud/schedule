"use client";

import { useEffect, useState } from "react";

// CDN から読み込む LIFF SDK の最小型
type Liff = {
  init: (c: { liffId: string }) => Promise<void>;
  isLoggedIn: () => boolean;
  isInClient: () => boolean;
  login: (opts?: { redirectUri?: string }) => void;
  getIDToken: () => string | null;
  getProfile: () => Promise<{ userId: string; displayName: string }>;
};

declare global {
  interface Window {
    liff?: Liff;
  }
}

const SDK_URL = "https://static.line-scdn.net/liff/edge/2/sdk.js";
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

function loadSdk(): Promise<Liff | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.liff) return Promise.resolve(window.liff);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.onload = () => resolve(window.liff ?? null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export type LiffState = {
  ready: boolean;
  enabled: boolean;
  idToken: string | null;
  displayName: string | null;
};

/**
 * LIFF を初期化し、LINE 内でログイン済みなら ID トークンと表示名を返す。
 * NEXT_PUBLIC_LIFF_ID 未設定時は無効状態（通常の Web 予約として動作）。
 */
export function useLiff(): LiffState {
  const [state, setState] = useState<LiffState>({
    ready: !LIFF_ID, // 未設定なら即 ready
    enabled: Boolean(LIFF_ID),
    idToken: null,
    displayName: null,
  });

  useEffect(() => {
    if (!LIFF_ID) return;
    let cancelled = false;

    (async () => {
      try {
        const liff = await loadSdk();
        if (!liff) {
          if (!cancelled) setState((s) => ({ ...s, ready: true }));
          return;
        }
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isLoggedIn()) {
          // LINE アプリ内ならログインさせて ID トークンを取得
          if (liff.isInClient()) {
            liff.login();
            return; // リダイレクト
          }
          if (!cancelled) setState((s) => ({ ...s, ready: true }));
          return;
        }

        const idToken = liff.getIDToken();
        let displayName: string | null = null;
        try {
          const p = await liff.getProfile();
          displayName = p.displayName;
        } catch {
          // プロフィール取得不可でも続行
        }
        if (!cancelled) {
          setState({ ready: true, enabled: true, idToken, displayName });
        }
      } catch (e) {
        console.error("[liff] init error", e);
        if (!cancelled) setState((s) => ({ ...s, ready: true }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
