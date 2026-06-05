import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuman, formatTime } from "@/lib/time";
import CancelButton from "./CancelButton";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "受付済み", cls: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { text: "予約確定", cls: "bg-green-100 text-green-800" },
  CANCELLED: { text: "キャンセル済み", cls: "bg-gray-200 text-gray-600" },
  COMPLETED: { text: "完了", cls: "bg-blue-100 text-blue-800" },
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: { service: true },
  });

  if (!booking) {
    return (
      <div className="max-w-md mx-auto mt-6 card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-gray-100 text-3xl">
          🔍
        </div>
        <h1 className="mt-4 font-bold text-lg">予約が見つかりません</h1>
        <p className="mt-2 text-sm text-gray-600">
          予約番号「{code}」は存在しません。
        </p>
        <Link
          href="/booking"
          className="mt-4 inline-block text-blue-700 underline text-sm"
        >
          別の番号で探す
        </Link>
      </div>
    );
  }

  const status = STATUS_LABEL[booking.status] ?? STATUS_LABEL.CONFIRMED;
  const cancellable =
    booking.status === "CONFIRMED" || booking.status === "PENDING";

  return (
    <div className="max-w-lg mx-auto mt-6 card overflow-hidden">
      <div className="relative bg-slate-900 px-6 py-5 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-900/60" />
        <div className="relative flex items-center justify-between">
          <h1 className="text-xl font-bold">予約内容</h1>
          <span className={`text-xs px-2.5 py-1 ${status.cls}`}>
            {status.text}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-5">

      <dl className="divide-y divide-gray-100 text-sm">
        <Row label="予約番号">
          <span className="font-mono">{booking.code}</span>
        </Row>
        <Row label="メニュー">{booking.service.name}</Row>
        <Row label="日時">
          {formatHuman(booking.startAt)} 〜 {formatTime(booking.endAt)}
        </Row>
        <Row label="お名前">{booking.customerName} 様</Row>
        {booking.carModel && <Row label="車種">{booking.carModel}</Row>}
        {booking.carPlate && <Row label="ナンバー">{booking.carPlate}</Row>}
        {booking.note && <Row label="備考">{booking.note}</Row>}
      </dl>

      {cancellable ? (
        <div className="pt-2 border-t border-gray-100">
          <CancelButton code={booking.code} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
          この予約は操作できません。
        </p>
      )}

        <Link
          href="/"
          className="block text-center text-sm text-blue-700 underline"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2 flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="text-right text-gray-900">{children}</dd>
    </div>
  );
}
