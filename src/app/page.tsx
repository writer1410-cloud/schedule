import Link from "next/link";

const features = [
  {
    icon: "📅",
    title: "かんたん予約受付",
    desc: "メニューと日付を選ぶだけ。空き枠がリアルタイムに表示されます。",
  },
  {
    icon: "🕒",
    title: "空き枠の自動表示",
    desc: "営業時間・作業所要時間・ピット数から予約可能な枠を自動計算。",
  },
  {
    icon: "🔗",
    title: "Google Calendar 連携",
    desc: "予約をそのままカレンダーへ登録。ダブルブッキングを防止（設定で有効化）。",
  },
  {
    icon: "✉️",
    title: "前日リマインド",
    desc: "来店前日に自動でメール通知。無断キャンセルを削減します。",
  },
  {
    icon: "⏳",
    title: "キャンセル待ち",
    desc: "満席日でも登録可能。空きが出たら先着で自動メール通知。",
  },
  {
    icon: "🛠️",
    title: "管理ダッシュボード",
    desc: "予約状況・キャンセル待ちを一覧管理。ステータス変更もワンクリック。",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          自動車整備の予約を、
          <br className="sm:hidden" />
          まるごと自動化。
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          予約受付・空き枠表示・Google Calendar
          連携・前日リマインド・キャンセル待ちを
          ひとつにまとめた、整備工場・販売店向けの予約システムです。
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/book"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            予約してみる
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            管理画面を見る
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
