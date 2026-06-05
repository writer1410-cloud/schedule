"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    if (next === "CANCELLED" && !confirm("この予約をキャンセルしますか？")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "CANCELLED" || status === "COMPLETED") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => update("COMPLETED")}
        disabled={busy}
        className="px-2 py-1 text-xs border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
      >
        完了
      </button>
      <button
        onClick={() => update("CANCELLED")}
        disabled={busy}
        className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        取消
      </button>
    </div>
  );
}
