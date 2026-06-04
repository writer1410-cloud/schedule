"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ code }: { code: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm("本当にこの予約をキャンセルしますか？")) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/bookings/${code}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "キャンセルに失敗しました");
        return;
      }
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={cancel}
        disabled={busy}
        className="px-5 py-2 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-50 disabled:opacity-50"
      >
        {busy ? "処理中…" : "予約をキャンセルする"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
