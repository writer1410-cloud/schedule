"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLiff } from "@/lib/useLiff";

type Service = { id: string; name: string };

function todayStr(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function WaitlistForm() {
  const params = useSearchParams();
  const liff = useLiff();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [desiredDate, setDesiredDate] = useState(todayStr());
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services);
        const qs = params.get("serviceId");
        if (qs && d.services.some((s: Service) => s.id === qs)) setServiceId(qs);
        else if (d.services[0]) setServiceId(d.services[0].id);
      });
    const qd = params.get("date");
    if (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) setDesiredDate(qd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LINE（LIFF）でログイン済みなら、お名前を初期入力
  useEffect(() => {
    if (liff.displayName) {
      setForm((f) =>
        f.customerName ? f : { ...f, customerName: liff.displayName! },
      );
    }
  }, [liff.displayName]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          desiredDate,
          ...form,
          lineIdToken: liff.idToken ?? undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "登録に失敗しました");
        return;
      }
      setDone(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-6 card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-3xl text-white shadow-lg">
          ⏳
        </div>
        <h1 className="mt-5 text-xl font-bold">
          キャンセル待ちに登録しました
        </h1>
        <p className="mt-2 text-gray-600">
          空きが出た場合、ご登録のメールアドレスへ先着でお知らせします。
        </p>
        <Link href="/" className="btn-ghost text-sm mt-6">
          トップへ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-2 card p-6 space-y-4">
      <div>
        <span className="eyebrow">満席でも安心</span>
        <h1 className="mt-3 text-2xl font-bold">キャンセル待ち登録</h1>
        <p className="mt-1 text-sm text-gray-600">
          ご希望の日に空きが出た際、先着でメール通知します。
        </p>
      </div>

      <label className="block">
        <span className="text-xs text-gray-500">メニュー *</span>
        <select
          className="input mt-1"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-gray-500">希望日 *</span>
        <input
          type="date"
          min={todayStr()}
          value={desiredDate}
          onChange={(e) => setDesiredDate(e.target.value)}
          className="input mt-1"
        />
      </label>

      <label className="block">
        <span className="text-xs text-gray-500">お名前 *</span>
        <input
          className="input mt-1"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="text-xs text-gray-500">メールアドレス *</span>
        <input
          type="email"
          className="input mt-1"
          value={form.customerEmail}
          onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="text-xs text-gray-500">電話番号</span>
        <input
          className="input mt-1"
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="text-xs text-gray-500">備考</span>
        <textarea
          rows={2}
          className="input mt-1"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={submit} disabled={submitting} className="btn-primary w-full">
        {submitting ? "送信中…" : "キャンセル待ちに登録"}
      </button>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
      <WaitlistForm />
    </Suspense>
  );
}
