"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Service } from "@/lib/services";
import { priceLabel } from "@/lib/format";

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

export default function BookingFlow({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const params = useSearchParams();
  const [services] = useState<Service[]>(initialServices);
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

  // クエリパラメータ（メニュー・日付）の反映
  useEffect(() => {
    const qsService = params.get("serviceId");
    if (qsService && services.some((s) => s.id === qsService)) {
      setServiceId(qsService);
    }
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
      <div className="max-w-lg mx-auto card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-3xl text-white shadow-lg">
          ✓
        </div>
        <h1 className="mt-5 text-xl font-bold">ご予約を受け付けました</h1>
        <p className="mt-2 text-gray-600">確認メールをお送りしました。</p>
        <div className="mt-4 inline-block bg-blue-50 text-blue-800 font-mono text-lg px-4 py-2 tracking-wider">
          {doneCode}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          予約番号は確認・キャンセルに必要です。大切に保管してください。
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href={`/booking/${doneCode}`} className="btn-primary text-sm">
            予約内容を確認
          </Link>
          <Link href="/" className="btn-ghost text-sm">
            トップへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="eyebrow">かんたん予約</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">予約する</h1>
        <p className="mt-1 text-sm text-gray-500">
          メニュー・日時・お客様情報の3ステップで完了します。
        </p>
      </div>

      {/* Step 1: メニュー選択 */}
      <section className="card p-5">
        <h2 className="flex items-center gap-2 font-semibold mb-3">
          <StepNum n={1} /> メニューを選ぶ
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={`text-left border p-3 transition ${
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
                所要 {s.durationMin}分 ・ {priceLabel(s.price)}
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
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <StepNum n={2} /> 日時を選ぶ
          </h2>
          <input
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="input max-w-[12rem]"
          />

          <div className="mt-4">
            {loadingAvail && (
              <p className="text-sm text-gray-500">空き枠を確認中…</p>
            )}
            {!loadingAvail && avail && !avail.open && (
              <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
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
                        className={`border px-2 py-2 text-sm transition ${
                          slotIso === s.startIso
                            ? "border-blue-500 bg-blue-600 text-white"
                            : s.available
                              ? "border-gray-200 hover:border-blue-400"
                              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        }`}
                        title={s.available ? `残り${s.remaining}枠` : "満席"}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {avail.slots.length > 0 &&
                  avail.slots.every((s) => !s.available) && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
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
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <StepNum n={3} /> お客様情報
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

          <div className="mt-4 bg-gray-50 p-3 text-sm">
            <span className="text-gray-500">予約内容：</span>{" "}
            <span className="font-medium">{selectedService?.name}</span> /{" "}
            {date}{" "}
            {avail?.slots.find((s) => s.startIso === slotIso)?.label}〜
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary mt-4 w-full sm:w-auto"
          >
            {submitting ? "送信中…" : "この内容で予約する"}
          </button>
        </section>
      )}
    </div>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
      {n}
    </span>
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
