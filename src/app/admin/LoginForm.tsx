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
    <div className="max-w-sm mx-auto mt-6 card p-7 space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl text-white shadow-lg">
          🔒
        </div>
        <h1 className="mt-4 text-xl font-bold">管理ログイン</h1>
        <p className="mt-1 text-xs text-gray-500">
          管理トークン（環境変数 ADMIN_TOKEN）を入力してください。
        </p>
      </div>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && login()}
        placeholder="ADMIN_TOKEN"
        className="input"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={login} disabled={busy} className="btn-primary w-full">
        {busy ? "確認中…" : "ログイン"}
      </button>
    </div>
  );
}
