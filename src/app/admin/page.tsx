import { prisma } from "@/lib/db";
import { isAdminLoggedIn } from "@/lib/auth";
import { dayStartUtc, toDateStr, formatHuman, formatDateHuman } from "@/lib/time";
import LoginForm from "./LoginForm";
import AdminToolbar from "./AdminToolbar";
import BookingActions from "./BookingActions";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "受付", cls: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { text: "確定", cls: "bg-green-100 text-green-800" },
  CANCELLED: { text: "取消", cls: "bg-gray-200 text-gray-500" },
  COMPLETED: { text: "完了", cls: "bg-blue-100 text-blue-800" },
};

const WAIT_LABEL: Record<string, string> = {
  WAITING: "待機中",
  NOTIFIED: "通知済み",
  CONVERTED: "予約成立",
  CANCELLED: "取消",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) {
    return <LoginForm />;
  }

  const todayStart = dayStartUtc(toDateStr(new Date()));

  const [upcoming, waitlist, todayCount, waitingCount] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: todayStart } },
      include: { service: true },
      orderBy: { startAt: "asc" },
      take: 100,
    }),
    prisma.waitlistEntry.findMany({
      where: { status: { in: ["WAITING", "NOTIFIED"] } },
      include: { service: true },
      orderBy: { desiredDate: "asc" },
    }),
    prisma.booking.count({
      where: {
        startAt: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 3600 * 1000),
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.waitlistEntry.count({ where: { status: "WAITING" } }),
  ]);

  // 日付ごとにグルーピング
  const groups = new Map<string, typeof upcoming>();
  for (const b of upcoming) {
    const key = toDateStr(b.startAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative px-5 sm:px-7 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs font-medium text-blue-300">
              Admin Dashboard
            </span>
            <h1 className="mt-0.5 text-2xl font-bold">管理ダッシュボード</h1>
          </div>
          <AdminToolbar />
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="本日の予約" value={todayCount} icon="📋" accent="from-blue-500 to-blue-600" />
        <Stat
          label="今後の予約"
          value={upcoming.filter((b) => b.status !== "CANCELLED").length}
          icon="🗓️"
          accent="from-violet-500 to-violet-600"
        />
        <Stat label="キャンセル待ち" value={waitingCount} icon="⏳" accent="from-amber-500 to-orange-600" />
      </div>

      {/* 予約一覧 */}
      <section>
        <h2 className="eyebrow mb-3">今後の予約</h2>
        {groups.size === 0 ? (
          <p className="text-sm text-gray-500">予約はありません。</p>
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {formatDateHuman(dayStartUtc(date))}
                </h3>

                {/* スマホ: カード表示 */}
                <div className="space-y-2 sm:hidden">
                  {items.map((b) => {
                    const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.CONFIRMED;
                    return (
                      <div key={b.id} className="card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-base font-semibold text-gray-700">
                            {formatHuman(b.startAt).split(" ")[1]}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}
                          >
                            {st.text}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ background: b.service.color }}
                          />
                          <span className="font-medium">{b.service.name}</span>
                        </div>
                        <div className="mt-1">{b.customerName}</div>
                        <div className="text-xs text-gray-400">
                          {b.carModel ?? ""} {b.customerPhone ?? ""}
                        </div>
                        <div className="mt-1 font-mono text-xs text-gray-400">
                          {b.code}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <BookingActions id={b.id} status={b.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PC: テーブル表示 */}
                <div className="hidden sm:block card overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {items.map((b) => {
                        const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.CONFIRMED;
                        return (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-600">
                              {formatHuman(b.startAt).split(" ")[1]}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                                style={{ background: b.service.color }}
                              />
                              {b.service.name}
                            </td>
                            <td className="px-3 py-2">
                              <div>{b.customerName}</div>
                              <div className="text-xs text-gray-400">
                                {b.carModel ?? ""} {b.customerPhone ?? ""}
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-400 whitespace-nowrap">
                              {b.code}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}
                              >
                                {st.text}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <BookingActions id={b.id} status={b.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* キャンセル待ち */}
      <section>
        <h2 className="eyebrow mb-3">キャンセル待ち</h2>
        {waitlist.length === 0 ? (
          <p className="text-sm text-gray-500">登録はありません。</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left whitespace-nowrap">希望日</th>
                  <th className="px-3 py-2 text-left">メニュー</th>
                  <th className="px-3 py-2 text-left">お客様</th>
                  <th className="px-3 py-2 text-left">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitlist.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDateHuman(w.desiredDate)}
                    </td>
                    <td className="px-3 py-2">{w.service.name}</td>
                    <td className="px-3 py-2">
                      <div>{w.customerName}</div>
                      <div className="text-xs text-gray-400">
                        {w.customerEmail}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {WAIT_LABEL[w.status] ?? w.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-xl text-white shadow-md`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-0.5 text-2xl font-bold leading-none">{value}</div>
      </div>
    </div>
  );
}
