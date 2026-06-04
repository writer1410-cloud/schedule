"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number | null;
  color: string;
};

type Slot = {
  startIso: string;
  label: string;
  available: boolean;
  remaining: number;
};

type Availability = {
  date: string;
  open: boolean;
  reason?: string;
  slots: Slot[];
};

function todayStr(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function yen(price: number | null): string {
  if (price === null) return "別途見積";
  if (price === 0) return "別途見積";
  return `¥${price.toLocaleString()}`;
}

function BookingFlow() {
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr());
  const [avail, setAvail] = useState<Availability | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [slotIso, setSlotIso] = useState<string>("");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    carModel: "",
    carPlate: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [doneCode, setDoneCode] = useState<string>("");

  // サービス一覧取得 + クエリパラメータ反映
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services);
        const qsService = params.get("serviceId");
        if (qsService && d.services.some((s: Service) => s.id === qsService)) {
          setServiceId(qsService);
        }
      });
    const qsDate = params.get("date");
    if (qsDate && /^\d{4}-\d{2}-\d{2}$/.test(qsDate)) setDate(qsDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!serviceId || !date) return;
    setLoadingAvail(true);
    setSlotIso("");
    try {
      const r = await fetch(
        `/api/availability?serviceId=${serviceId}&date=${date}`,
      );
      setAvail(await r.json());
    } finally {
      setLoadingAvail(false);
    }
  }, [serviceId, date]);

  useEffect(() => {
    if (serviceId && date) loadAvailability();
  }, [serviceId, date, loadAvailability]);

  const selectedService = services.find((s) => s.id === serviceId);

  async function submit() {
    setError("");
    if (!slotIso) {
      setError("予約枠を選択してください");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, startIso: slotIso, ...form }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "予約に失敗しました");
        // 枠が埋まった可能性 → 空き枠を再取得
        loadAvailability();
        return;
      }
      setDoneCode(d.code);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  // 完了画面
  if (doneCode) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="mt-4 text-xl font-bold">ご予約を受け付けました</h1>
        <p className="mt-2 text-gray-600">確認メールをお送りしました。</p>
        <div className="mt-4 inline-block bg-blue-50 text-blue-800 font-mono text-lg px-4 py-2 rounded-lg">
          {doneCode}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          予約番号は確認・キャンセルに必要です。大切に保管してください。
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href={`/booking/${doneCode}`}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            予約内容を確認
          </Link>
          <Link
            href="/"
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
          >
            トップへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">予約する</h1>

      {/* Step 1: メニュー選択 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-3">
          <span className="text-blue-600">1.</span> メニューを選ぶ
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`text-left rounded-lg border p-3 transition ${
                serviceId === s.id
                  ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="font-medium">{s.name}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                所要 {s.durationMin}分 ・ {yen(s.price)}
              </div>
              {s.description && (
                <div className="mt-1 text-xs text-gray-400">{s.description}</div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: 日付・枠選択 */}
      {serviceId && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">
            <span className="text-blue-600">2.</span> 日時を選ぶ
          </h2>
          <input
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <div className="mt-4">
            {loadingAvail && (
              <p className="text-sm text-gray-500">空き枠を確認中…</p>
            )}
            {!loadingAvail && avail && !avail.open && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                この日は予約できません（{avail.reason}）。
                <div className="mt-2">
                  <WaitlistLink serviceId={serviceId} date={date} />
                </div>
              </div>
            )}
            {!loadingAvail && avail && avail.open && (
              <>
                {avail.slots.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    この日の予約可能枠はありません。
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {avail.slots.map((s) => (
                      <button
                        key={s.startIso}
                        disabled={!s.available}
                        onClick={() => setSlotIso(s.startIso)}
                        className={`rounded-lg border px-2 py-2 text-sm transition ${
                          slotIso === s.startIso
                            ? "border-blue-500 bg-blue-600 text-white"
                            : s.available
                              ? "border-gray-200 hover:border-blue-400"
                              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        }`}
                        title={
                          s.available ? `残り${s.remaining}枠` : "満席"
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {avail.slots.length > 0 &&
                  avail.slots.every((s) => !s.available) && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                      すべて満席です。
                      <WaitlistLink serviceId={serviceId} date={date} />
                    </div>
                  )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Step 3: お客様情報 */}
      {slotIso && (
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">
            <span className="text-blue-600">3.</span> お客様情報
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="お名前 *">
              <input
                className="input"
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </Field>
            <Field label="メールアドレス *">
              <input
                type="email"
                className="input"
                value={form.customerEmail}
                onChange={(e) =>
                  setForm({ ...form, customerEmail: e.target.value })
                }
              />
            </Field>
            <Field label="電話番号">
              <input
                className="input"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm({ ...form, customerPhone: e.target.value })
                }
              />
            </Field>
            <Field label="車種">
              <input
                className="input"
                value={form.carModel}
                onChange={(e) => setForm({ ...form, carModel: e.target.value })}
              />
            </Field>
            <Field label="ナンバー">
              <input
                className="input"
                value={form.carPlate}
                onChange={(e) => setForm({ ...form, carPlate: e.target.value })}
              />
            </Field>
            <Field label="ご要望・備考" full>
              <textarea
                className="input"
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
            <span className="text-gray-500">予約内容：</span>{" "}
            <span className="font-medium">{selectedService?.name}</span> /{" "}
            {date}{" "}
            {avail?.slots.find((s) => s.startIso === slotIso)?.label}〜
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-4 w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "送信中…" : "この内容で予約する"}
          </button>
        </section>
      )}

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px #bfdbfe;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function WaitlistLink({ serviceId, date }: { serviceId: string; date: string }) {
  return (
    <Link
      href={`/waitlist?serviceId=${serviceId}&date=${date}`}
      className="text-blue-700 underline ml-1"
    >
      キャンセル待ちに登録する →
    </Link>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
      <BookingFlow />
    </Suspense>
  );
}
