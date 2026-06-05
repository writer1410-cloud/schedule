import Link from "next/link";
import { getActiveServices } from "@/lib/services";
import { priceLabel } from "@/lib/format";
import { SHOP } from "@/lib/shop";

// メニューを DB から読むため、ビルド時プリレンダーは行わずリクエスト時に描画
export const dynamic = "force-dynamic";

// 写真は CSS 背景として読み込み（万一URLが落ちても下地グラデーションが残り、画像欠けが出ない）
const IMG = {
  hero: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80",
  garage:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
  engine:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
};

const reasons = [
  {
    icon: "🔧",
    title: "国家資格の整備士が在籍",
    desc: "経験豊富な整備士が、日常点検から本格的な修理まで丁寧に対応します。",
  },
  {
    icon: "📝",
    title: "作業前に必ずお見積り",
    desc: "内容をご説明し、ご納得いただいてから作業。勝手な追加費用はありません。",
  },
  {
    icon: "🚙",
    title: "代車無料・送迎あり",
    desc: "車検や修理でお預かりの間も代車をご用意。お車のない不便を減らします。",
  },
  {
    icon: "📱",
    title: "24時間ネット予約",
    desc: "スマホからいつでも予約OK。前日にはリマインドメールもお送りします。",
  },
];

export default async function Home() {
  const services = await getActiveServices();

  return (
    <div className="space-y-16">
      {/* ヒーロー */}
      <section className="relative -mx-4 sm:mx-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundColor: "#0b1220",
            backgroundImage: `linear-gradient(110deg, rgba(8,12,24,0.94) 0%, rgba(8,12,24,0.78) 45%, rgba(8,12,24,0.4) 100%), url('${IMG.hero}')`,
          }}
        />
        <div className="relative px-6 sm:px-12 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 px-3 py-1 text-xs font-medium text-blue-200">
            {SHOP.since}・{SHOP.area}
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            {SHOP.tagline}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300">
            {SHOP.name}
          </p>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-gray-400">
            車検・点検・オイル交換・タイヤ交換から修理のご相談まで。
            {SHOP.area}のあなたのカーライフを、地域密着でサポートします。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-7 py-3.5 bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition"
            >
              Web予約はこちら →
            </Link>
            <a
              href={`tel:${SHOP.phone.replace(/-/g, "")}`}
              className="px-7 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold hover:bg-white/20 transition"
            >
              ☎ {SHOP.phone}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-300">
            <div>
              <span className="block text-xs text-gray-500">営業時間</span>
              {SHOP.hours}
            </div>
            <div>
              <span className="block text-xs text-gray-500">定休日</span>
              {SHOP.closed}
            </div>
            <div>
              <span className="block text-xs text-gray-500">アクセス</span>
              {SHOP.access}
            </div>
          </div>
        </div>
      </section>

      {/* 選ばれる理由 */}
      <section>
        <div className="text-center mb-8">
          <span className="eyebrow">選ばれる理由</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
            安心して、クルマを預けられる工場です
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-white border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-2xl">
                {r.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{r.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                {r.desc}
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
              小さな違和感も、
              <br />
              お気軽にご相談ください。
            </h2>
            <p className="mt-4 text-gray-300 leading-relaxed">
              「異音がする」「警告灯が点いた」など、原因のわからない不具合も
              まずは点検・お見積りから。無理な作業はおすすめしません。
            </p>
            <Link
              href="/book"
              className="mt-6 inline-block px-6 py-3 bg-white text-slate-900 font-semibold hover:bg-gray-100 transition"
            >
              相談を予約する →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "30分〜", l: "オイル交換" },
              { n: "2台", l: "同時作業" },
              { n: "無料", l: "代車・見積" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-white/10 backdrop-blur border border-white/15 p-4 text-center"
              >
                <div className="text-lg font-bold text-white">{s.n}</div>
                <div className="mt-1 text-xs text-gray-300">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金・メニュー */}
      <section>
        <div className="text-center mb-8">
          <span className="eyebrow">料金・メニュー</span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
            わかりやすい料金で
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            表示価格は目安です。車種・状態により変動します（事前にお見積り）。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-col bg-white border border-gray-200 p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-1.5 shrink-0"
                  style={{ background: s.color }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    所要 {s.durationMin}分
                  </div>
                </div>
                <div className="text-right font-bold text-blue-700">
                  {priceLabel(s.price)}
                </div>
              </div>
              {s.description && (
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {s.description}
                </p>
              )}
              <Link
                href={`/book?serviceId=${s.id}`}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 self-end"
              >
                このメニューで予約 →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 営業案内 */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white border border-gray-200 p-6">
          <span className="eyebrow">営業案内</span>
          <dl className="mt-4 divide-y divide-gray-100 text-sm">
            <Info label="店舗名">{SHOP.name}</Info>
            <Info label="所在地">{SHOP.address}</Info>
            <Info label="電話番号">
              <a
                href={`tel:${SHOP.phone.replace(/-/g, "")}`}
                className="text-blue-700"
              >
                {SHOP.phone}
              </a>
            </Info>
            <Info label="営業時間">{SHOP.hours}</Info>
            <Info label="定休日">{SHOP.closed}</Info>
            <Info label="アクセス">{SHOP.access}</Info>
          </dl>
        </div>

        {/* CTA */}
        <div
          className="relative overflow-hidden text-center flex items-center justify-center"
          style={{ backgroundColor: "#1e3a8a" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url('${IMG.garage}')` }}
          />
          <div className="relative px-6 py-12">
            <h2 className="text-2xl font-bold text-white">
              ご予約はWEBから24時間
            </h2>
            <p className="mt-3 text-blue-100 text-sm">
              メニューと日付を選ぶだけ。最短1分で予約完了です。
            </p>
            <Link
              href="/book"
              className="mt-6 inline-block px-8 py-4 bg-white text-blue-700 font-bold shadow-lg hover:bg-gray-100 transition"
            >
              予約をはじめる →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2.5 flex gap-4">
      <dt className="w-20 shrink-0 text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}
