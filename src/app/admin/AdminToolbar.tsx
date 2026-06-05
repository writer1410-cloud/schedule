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
    <div className="flex items-center gap-2">
      {msg && (
        <span className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-1 rounded-lg">
          {msg}
        </span>
      )}
      <button
        onClick={runReminders}
        disabled={busy}
        className="px-3 py-2 text-sm rounded-lg bg-white text-slate-900 font-medium hover:bg-gray-100 disabled:opacity-50 transition"
      >
        {busy ? "送信中…" : "前日リマインド送信"}
      </button>
      <button
        onClick={logout}
        className="px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
      >
        ログアウト
      </button>
    </div>
  );
}
