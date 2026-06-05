"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="max-w-md mx-auto mt-6 card p-7 space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl text-white shadow-lg">
          🔍
        </div>
        <h1 className="mt-4 text-xl font-bold">予約確認・キャンセル</h1>
        <p className="mt-1 text-sm text-gray-600">
          予約完了メールに記載の予約番号を入力してください。
        </p>
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) =>
          e.key === "Enter" && code && router.push(`/booking/${code.trim()}`)
        }
        placeholder="BK-XXXXXX"
        className="input font-mono text-center tracking-wider"
      />
      <button
        onClick={() => code && router.push(`/booking/${code.trim()}`)}
        className="btn-primary w-full"
      >
        確認する
      </button>
    </div>
  );
}
