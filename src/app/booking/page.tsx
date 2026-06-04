"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h1 className="text-2xl font-bold">予約確認・キャンセル</h1>
      <p className="text-sm text-gray-600">
        予約完了メールに記載の予約番号を入力してください。
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="BK-XXXXXX"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
      />
      <button
        onClick={() => code && router.push(`/booking/${code.trim()}`)}
        className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
      >
        確認する
      </button>
    </div>
  );
}
