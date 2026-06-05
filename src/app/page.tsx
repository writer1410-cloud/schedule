import Link from "next/link";

// 写真は CSS 背景として読み込み（万一URLが落ちても下地グラデーションが残り、画像欠けが出ない）
const IMG = {
  hero: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80", // 黒のスポーツカー
  garage:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80", // ガレージ
  engine:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80", // 整備中
};

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

const services = [
  { name: "オイル交換", time: "約30分", color: "#16a34a" },
  { name: "タイヤ交換・履き替え", time: "約60分", color: "#2563eb" },
  { name: "12ヶ月点検", time: "約90分", color: "#7c3aed" },
  { name: "車検", time: "約120分", color: "#dc2626" },
  { name: "バッテリー交換", time: "約30分", color: "#ea580c" },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* ヒーロー */}
      <section className="relative -mx-4 sm:mx-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundColor: "#0b1220",
            backgroundImage: `linear-gradient(110deg, rgba(8,12,24,0.92) 0%, rgba(8,12,24,0.72) 45%, rgba(8,12,24,0.35) 100%), url('${IMG.hero}')`,
          }}
        />
        <div className="relative px-6 sm:px-12 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 px-3 py-1 text-xs font-medium text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            自動車整備・販売店向け 予約システム
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            クルマの予約を、
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              スマートに自動化。
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-gray-300">
            予約受付・空き枠表示・Google Calendar 連携・前日リマインド・
            キャンセル待ちをひとつに。整備工場の予約業務を、まるごと効率化します。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-7 py-3.5 bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition"
            >
              予約してみる →
            </Link>
            <Link
              href="/admin"
              className="px-7 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold hover:bg-white/20 transition"
            >
              管理画面を見る
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400">
            <div>
              <span className="text-2xl font-bold text-white">24h</span>
              <span className="ml-2">ネット受付</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">5</span>
              <span className="ml-2">整備メニュー</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">0</span>
              <span className="ml-2">ダブルブッキング</span>
            </div>
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            予約業務に必要なものを、すべて
          </h2>
          <p className="mt-2 text-gray-600">
            受付から当日の管理まで、現場の流れに合わせた機能を用意しました。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-2xl group-hover:bg-blue-600 group-hover:scale-105 transition">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 整備品質バンド（写真） */}
      <section
        className="relative -mx-4 sm:mx-0 overflow-hidden"
        style={{ backgroundColor: "#0f172a" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('${IMG.engine}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        <div className="relative px-6 sm:px-12 py-16 grid gap-8 sm:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              確かな整備を、
              <br />
              待たせない予約体験で。
            </h2>
            <p className="mt-4 text-gray-300 leading-relaxed">
              ピット数と作業時間から空き枠を自動計算。お客様はスマホから24時間予約でき、
              スタッフは当日の段取りに集中できます。
            </p>
            <Link
              href="/book"
              className="mt-6 inline-block px-6 py-3 bg-white text-slate-900 font-semibold hover:bg-gray-100 transition"
            >
              空き枠を見る →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "30分", l: "最短作業" },
              { n: "2基", l: "同時受付" },
              { n: "前日", l: "自動通知" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-white/10 backdrop-blur border border-white/15 p-4 text-center"
              >
                <div className="text-xl font-bold text-white">{s.n}</div>
                <div className="mt-1 text-xs text-gray-300">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* メニュー */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            整備メニュー
          </h2>
          <p className="mt-2 text-gray-600">
            目的に合わせて選べる、わかりやすい料金・所要時間。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 bg-white border border-gray-200 p-5 hover:shadow-lg transition"
            >
              <span
                className="h-10 w-1.5 shrink-0"
                style={{ background: s.color }}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500">所要 {s.time}</div>
              </div>
              <Link
                href="/book"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                予約 →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative -mx-4 sm:mx-0 overflow-hidden text-center"
        style={{ backgroundColor: "#1e3a8a" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${IMG.garage}')` }}
        />
        <div className="relative px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            さっそく予約してみませんか？
          </h2>
          <p className="mt-3 text-blue-100">
            メニューと日付を選ぶだけ。最短1分で予約完了です。
          </p>
          <Link
            href="/book"
            className="mt-7 inline-block px-8 py-4 bg-white text-blue-700 font-bold shadow-lg hover:bg-gray-100 transition"
          >
            予約をはじめる →
          </Link>
        </div>
      </section>
    </div>
  );
}
