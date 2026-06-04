"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminToolbar() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function runReminders() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/reminders", { method: "POST" });
      const d = await r.json();
      setMsg(r.ok ? `リマインド ${d.sent} 件送信しました` : (d.error ?? "失敗"));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-xs text-green-700">{msg}</span>}
      <button
        onClick={runReminders}
        disabled={busy}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        前日リマインド送信
      </button>
      <button
        onClick={logout}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
      >
        ログアウト
      </button>
    </div>
  );
}
