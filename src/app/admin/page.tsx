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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
        <AdminToolbar />
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="本日の予約" value={todayCount} />
        <Stat label="今後の予約" value={upcoming.filter((b) => b.status !== "CANCELLED").length} />
        <Stat label="キャンセル待ち" value={waitingCount} />
      </div>

      {/* 予約一覧 */}
      <section>
        <h2 className="font-semibold mb-3">今後の予約</h2>
        {groups.size === 0 ? (
          <p className="text-sm text-gray-500">予約はありません。</p>
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {formatDateHuman(dayStartUtc(date))}
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {items.map((b) => {
                        const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.CONFIRMED;
                        return (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-600">
                              {formatHuman(b.startAt).split(" ")[1]}
                            </td>
                            <td className="px-3 py-2">
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
                            <td className="px-3 py-2 font-mono text-xs text-gray-400">
                              {b.code}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}
                              >
                                {st.text}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
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
        <h2 className="font-semibold mb-3">キャンセル待ち</h2>
        {waitlist.length === 0 ? (
          <p className="text-sm text-gray-500">登録はありません。</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">希望日</th>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
