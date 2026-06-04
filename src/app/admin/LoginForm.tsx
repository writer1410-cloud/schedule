"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error ?? "ログインに失敗しました");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h1 className="text-xl font-bold">管理ログイン</h1>
      <p className="text-xs text-gray-500">
        管理トークン（環境変数 ADMIN_TOKEN）を入力してください。
      </p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && login()}
        placeholder="ADMIN_TOKEN"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={login}
        disabled={busy}
        className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "確認中…" : "ログイン"}
      </button>
    </div>
  );
}
