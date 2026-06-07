// 業種プリセット。1か所（環境変数 NEXT_PUBLIC_INDUSTRY）の切替で、
// 店名・用語・メニュー・追加入力項目・トップページの文言が業種に合わせて変わる。
//
//   NEXT_PUBLIC_INDUSTRY=generic  中立な汎用テンプレ（デフォルト）
//   NEXT_PUBLIC_INDUSTRY=auto     自動車整備工場
//   NEXT_PUBLIC_INDUSTRY=salon    美容室・サロン
//   NEXT_PUBLIC_INDUSTRY=clinic   治療院・クリニック
//   NEXT_PUBLIC_INDUSTRY=dining   飲食・予約席
//
// DBのカラム（carModel / carPlate）は汎用の「追加入力欄1・2」として再利用する。
// 業種ごとに label を変えるだけで、スキーマ変更なしに任意の入力欄になる。

export type CustomFieldKey = "carModel" | "carPlate";

export type CustomField = {
  key: CustomFieldKey;
  label: string;
  placeholder?: string;
};

export type PresetService = {
  name: string;
  durationMin: number;
  price: number | null;
  color: string;
  sortOrder: number;
  description: string;
};

export type Preset = {
  id: string;
  icon: string; // ヘッダー/フッターのアイコン（絵文字）

  // 店舗情報
  name: string;
  brand: string; // ヘッダーの短い表示名
  tagline: string;
  since: string;
  area: string;
  phone: string;
  address: string;
  access: string;
  hours: string;
  closed: string;

  // 用語・追加入力欄
  serviceWord: string; // 「メニュー」「コース」「診療メニュー」など
  customFields: CustomField[];

  // トップページの文言
  heroLead: string;
  reasonsHeading: string;
  reasons: { icon: string; title: string; desc: string }[];
  qualityBand: {
    heading: string;
    body: string;
    cta: string;
    stats: { n: string; l: string }[];
  };
  priceHeading: string;
  priceNote: string;
  ctaHeading: string;
  ctaBody: string;

  // メタ情報
  metaTitle: string;
  metaDescription: string;

  // 写真（任意。無い場合はグラデーション背景のみ）
  images?: { hero?: string; garage?: string; engine?: string };

  // 運用初期値（seed で使用）
  timezone: string;
  slotInterval: number;
  capacity: number;
  openMin: number;
  closeMin: number;
  closedWeekdays: number[]; // 0=日 ... 6=土
  services: PresetService[];
  demoFields?: Partial<Record<CustomFieldKey, string>>;
};

const TZ = "Asia/Tokyo";

// ───────────────────────── 中立な汎用テンプレ（デフォルト） ─────────────────────────
const generic: Preset = {
  id: "generic",
  icon: "🗓️",
  name: "サンプル予約",
  brand: "サンプル予約",
  tagline: "かんたん予約、いつでもどこでも。",
  since: "ご予約受付中",
  area: "オンライン予約対応",
  phone: "03-0000-0000",
  address: "東京都千代田区サンプル1-2-3",
  access: "最寄り駅から徒歩5分",
  hours: "月〜土 9:00〜18:00",
  closed: "日曜・祝日",

  serviceWord: "メニュー",
  customFields: [],

  heroLead:
    "ご希望のメニューと日時を選ぶだけ。スマートフォンから24時間いつでもご予約いただけます。",
  reasonsHeading: "選ばれる理由",
  reasons: [
    { icon: "📱", title: "24時間ネット予約", desc: "スマホからいつでも予約OK。電話がつながらない時間帯でも受付できます。" },
    { icon: "✅", title: "確認・変更がかんたん", desc: "予約番号からいつでも内容の確認・キャンセルが可能です。" },
    { icon: "🔔", title: "リマインドでうっかり防止", desc: "ご予約前日に自動でお知らせ。予約忘れを防ぎます。" },
    { icon: "💬", title: "LINEでもお知らせ", desc: "LINE連携で確定・リマインドをトークにお届けします。" },
  ],
  qualityBand: {
    heading: "ご予約は\nWebでかんたん。",
    body: "メニューと日時を選ぶだけ。空き状況はリアルタイムに表示され、その場で予約が完了します。",
    cta: "予約をはじめる →",
    stats: [
      { n: "24h", l: "ネット受付" },
      { n: "1分", l: "で予約完了" },
      { n: "無料", l: "予約・変更" },
    ],
  },
  priceHeading: "メニュー一覧",
  priceNote: "表示価格は目安です。内容により変動する場合があります。",
  ctaHeading: "ご予約はWebから24時間",
  ctaBody: "メニューと日付を選ぶだけ。最短1分で予約完了です。",
  metaTitle: "オンライン予約",
  metaDescription:
    "メニューと日時を選ぶだけのかんたんWeb予約。24時間いつでもご予約いただけます。",

  timezone: TZ,
  slotInterval: 30,
  capacity: 1,
  openMin: 9 * 60,
  closeMin: 18 * 60,
  closedWeekdays: [0],
  services: [
    { name: "スタンダードコース", durationMin: 30, price: 3300, color: "#2563eb", sortOrder: 1, description: "基本のメニュー（約30分）" },
    { name: "ロングコース", durationMin: 60, price: 6600, color: "#7c3aed", sortOrder: 2, description: "じっくり対応するメニュー（約60分）" },
    { name: "プレミアムコース", durationMin: 90, price: 9900, color: "#16a34a", sortOrder: 3, description: "充実の内容（約90分）" },
    { name: "初回ご相談", durationMin: 30, price: null, color: "#0891b2", sortOrder: 4, description: "はじめての方向け。ご要望をお伺いします。" },
  ],
};

// ───────────────────────── 自動車整備工場 ─────────────────────────
const auto: Preset = {
  id: "auto",
  icon: "🚗",
  name: "みなと自動車整備工場",
  brand: "みなと自動車",
  tagline: "地域のクルマの、かかりつけ。",
  since: "創業1998年",
  area: "東京都港区・芝浦",
  phone: "03-5775-1234",
  address: "東京都港区芝浦3-14-5",
  access: "JR田町駅から徒歩6分／駐車場・代車あり",
  hours: "月〜土 9:00〜18:00",
  closed: "日曜・祝日",

  serviceWord: "メニュー",
  customFields: [
    { key: "carModel", label: "車種" },
    { key: "carPlate", label: "ナンバー" },
  ],

  heroLead:
    "車検・点検・オイル交換・タイヤ交換から修理のご相談まで。東京都港区・芝浦のあなたのカーライフを、地域密着でサポートします。",
  reasonsHeading: "選ばれる理由",
  reasons: [
    { icon: "🔧", title: "国家資格の整備士が在籍", desc: "経験豊富な整備士が、日常点検から本格的な修理まで丁寧に対応します。" },
    { icon: "📝", title: "作業前に必ずお見積り", desc: "内容をご説明し、ご納得いただいてから作業。勝手な追加費用はありません。" },
    { icon: "🚙", title: "代車無料・送迎あり", desc: "車検や修理でお預かりの間も代車をご用意。お車のない不便を減らします。" },
    { icon: "📱", title: "24時間ネット予約", desc: "スマホからいつでも予約OK。前日にはリマインドメールもお送りします。" },
  ],
  qualityBand: {
    heading: "小さな違和感も、\nお気軽にご相談ください。",
    body: "「異音がする」「警告灯が点いた」など、原因のわからない不具合もまずは点検・お見積りから。無理な作業はおすすめしません。",
    cta: "相談を予約する →",
    stats: [
      { n: "30分〜", l: "オイル交換" },
      { n: "2台", l: "同時作業" },
      { n: "無料", l: "代車・見積" },
    ],
  },
  priceHeading: "わかりやすい料金で",
  priceNote: "表示価格は目安です。車種・状態により変動します（事前にお見積り）。",
  ctaHeading: "ご予約はWEBから24時間",
  ctaBody: "メニューと日付を選ぶだけ。最短1分で予約完了です。",
  metaTitle: "車検・点検・修理のWeb予約",
  metaDescription:
    "東京都港区・芝浦の自動車整備工場。車検・点検・オイル交換・タイヤ交換・修理のご相談をWebから24時間予約できます。",

  images: {
    hero: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80",
    garage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
    engine: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
  },

  timezone: TZ,
  slotInterval: 30,
  capacity: 2,
  openMin: 9 * 60,
  closeMin: 18 * 60,
  closedWeekdays: [0],
  services: [
    { name: "オイル交換", durationMin: 30, price: 4400, color: "#16a34a", sortOrder: 1, description: "エンジンオイル＋エレメント交換" },
    { name: "タイヤ交換・履き替え", durationMin: 60, price: 6600, color: "#2563eb", sortOrder: 2, description: "タイヤ4本の脱着・バランス調整" },
    { name: "12ヶ月点検", durationMin: 90, price: 13200, color: "#7c3aed", sortOrder: 3, description: "法定12ヶ月点検（一般整備）" },
    { name: "車検", durationMin: 120, price: 0, color: "#dc2626", sortOrder: 4, description: "継続車検（料金は車種により別途見積）" },
    { name: "バッテリー交換", durationMin: 30, price: 3300, color: "#ea580c", sortOrder: 5, description: "バッテリーの点検・交換" },
    { name: "その他（修理のご相談など）", durationMin: 30, price: null, color: "#0891b2", sortOrder: 6, description: "気になる不具合や修理のご相談。内容に応じてお見積りいたします。" },
  ],
  demoFields: { carModel: "トヨタ プリウス", carPlate: "品川 300 あ 12-34" },
};

// ───────────────────────── 美容室・サロン ─────────────────────────
const salon: Preset = {
  id: "salon",
  icon: "💇",
  name: "Hair & Spa LUNA",
  brand: "LUNA",
  tagline: "なりたいを、あなたのペースで。",
  since: "渋谷の隠れ家サロン",
  area: "東京都渋谷区",
  phone: "03-1234-5678",
  address: "東京都渋谷区神南1-9-8",
  access: "JR渋谷駅から徒歩7分",
  hours: "火〜日 10:00〜19:00",
  closed: "月曜",

  serviceWord: "メニュー",
  customFields: [
    { key: "carModel", label: "ご希望スタイル・ご指名（任意）", placeholder: "例）肩につくボブ／○○さん指名" },
  ],

  heroLead:
    "カット・カラーからヘッドスパまで。一人ひとりの髪質とライフスタイルに合わせて、ていねいに仕上げます。",
  reasonsHeading: "LUNAが選ばれる理由",
  reasons: [
    { icon: "✂️", title: "指名予約OK", desc: "お気に入りのスタイリストをそのままご指名いただけます。" },
    { icon: "🌿", title: "髪にやさしい薬剤", desc: "ダメージを抑えたカラー・パーマで、繰り返しても美しい髪へ。" },
    { icon: "🛋️", title: "ゆったり空間", desc: "完全予約制でお待たせしません。リラックスしてお過ごしください。" },
    { icon: "📱", title: "24時間ネット予約", desc: "スマホからいつでも予約OK。前日リマインドもお届けします。" },
  ],
  qualityBand: {
    heading: "髪のお悩み、\nお気軽にご相談ください。",
    body: "「広がりが気になる」「白髪が増えてきた」など、まずはカウンセリングから。無理におすすめはいたしません。",
    cta: "カウンセリングを予約 →",
    stats: [
      { n: "指名", l: "無料" },
      { n: "完全", l: "予約制" },
      { n: "個室", l: "スパあり" },
    ],
  },
  priceHeading: "メニュー・料金",
  priceNote: "表示価格は目安です。髪の長さ・状態により変動します。",
  ctaHeading: "ご予約はWebから24時間",
  ctaBody: "メニューと日時を選ぶだけ。最短1分で予約完了です。",
  metaTitle: "ヘアサロンのWeb予約",
  metaDescription:
    "東京都渋谷区のヘアサロン。カット・カラー・パーマ・ヘッドスパのご予約をWebから24時間受付しています。",

  timezone: TZ,
  slotInterval: 30,
  capacity: 3,
  openMin: 10 * 60,
  closeMin: 19 * 60,
  closedWeekdays: [1],
  services: [
    { name: "カット", durationMin: 60, price: 5500, color: "#db2777", sortOrder: 1, description: "シャンプー・ブロー込み" },
    { name: "カット＋カラー", durationMin: 120, price: 11000, color: "#9333ea", sortOrder: 2, description: "お好みの色味でていねいに" },
    { name: "パーマ", durationMin: 120, price: 12100, color: "#2563eb", sortOrder: 3, description: "ダメージを抑えた薬剤を使用" },
    { name: "トリートメント", durationMin: 45, price: 4400, color: "#16a34a", sortOrder: 4, description: "髪質改善トリートメント" },
    { name: "ヘッドスパ", durationMin: 45, price: 5500, color: "#0891b2", sortOrder: 5, description: "頭皮ケア・リラクゼーション" },
    { name: "その他（ご相談）", durationMin: 30, price: null, color: "#64748b", sortOrder: 6, description: "メニューに迷ったらまずはご相談ください。" },
  ],
  demoFields: { carModel: "ボブ／佐藤指名" },
};

// ───────────────────────── 治療院・クリニック ─────────────────────────
const clinic: Preset = {
  id: "clinic",
  icon: "🩺",
  name: "しばうら整骨院・鍼灸院",
  brand: "しばうら治療院",
  tagline: "つらい痛み、根本から。",
  since: "地域密着の治療院",
  area: "東京都港区",
  phone: "03-2345-6789",
  address: "東京都港区芝浦4-12-1",
  access: "JR田町駅から徒歩5分",
  hours: "月〜土 9:00〜19:00",
  closed: "日曜・祝日",

  serviceWord: "診療メニュー",
  customFields: [
    { key: "carModel", label: "気になる症状・お悩み", placeholder: "例）腰の痛み／肩こり" },
  ],

  heroLead:
    "整体・鍼灸・骨盤矯正で、肩こり・腰痛・スポーツ障害を根本からケア。お一人おひとりに合わせた施術プランをご提案します。",
  reasonsHeading: "当院が選ばれる理由",
  reasons: [
    { icon: "🩺", title: "国家資格者が施術", desc: "柔道整復師・鍼灸師の有資格者が、症状に合わせて対応します。" },
    { icon: "📋", title: "初回カウンセリング重視", desc: "お悩みを丁寧にお伺いし、施術方針をご説明してから始めます。" },
    { icon: "🕘", title: "平日夜まで受付", desc: "お仕事帰りにも通いやすい時間帯まで受け付けています。" },
    { icon: "📱", title: "24時間ネット予約", desc: "スマホからいつでも予約OK。前日リマインドもお届けします。" },
  ],
  qualityBand: {
    heading: "その痛み、\n我慢していませんか。",
    body: "「マッサージでは戻ってしまう」「どこに行けばいいかわからない」など、まずはカウンセリングから。原因に合わせてケアします。",
    cta: "カウンセリングを予約 →",
    stats: [
      { n: "国家", l: "資格者" },
      { n: "夜19時", l: "まで受付" },
      { n: "初回", l: "相談OK" },
    ],
  },
  priceHeading: "診療メニュー・料金",
  priceNote: "表示価格は目安です。症状・施術内容により変動します。",
  ctaHeading: "ご予約はWebから24時間",
  ctaBody: "メニューと日時を選ぶだけ。最短1分で予約完了です。",
  metaTitle: "整骨院・鍼灸院のWeb予約",
  metaDescription:
    "東京都港区の整骨院・鍼灸院。整体・鍼灸・骨盤矯正のご予約をWebから24時間受付しています。",

  timezone: TZ,
  slotInterval: 30,
  capacity: 2,
  openMin: 9 * 60,
  closeMin: 19 * 60,
  closedWeekdays: [0],
  services: [
    { name: "初診カウンセリング", durationMin: 45, price: 3300, color: "#0891b2", sortOrder: 1, description: "お悩みのヒアリングと検査" },
    { name: "整体・矯正", durationMin: 30, price: 4400, color: "#2563eb", sortOrder: 2, description: "骨格・姿勢のバランス調整" },
    { name: "鍼灸施術", durationMin: 45, price: 5500, color: "#7c3aed", sortOrder: 3, description: "鍼・灸によるケア" },
    { name: "骨盤矯正", durationMin: 30, price: 4400, color: "#16a34a", sortOrder: 4, description: "骨盤のゆがみを整える" },
    { name: "マッサージ", durationMin: 60, price: 6600, color: "#ea580c", sortOrder: 5, description: "全身の筋肉をほぐす" },
    { name: "その他（ご相談）", durationMin: 30, price: null, color: "#64748b", sortOrder: 6, description: "症状に迷ったらまずはご相談ください。" },
  ],
  demoFields: { carModel: "腰の痛み" },
};

// ───────────────────────── 飲食・予約席 ─────────────────────────
const dining: Preset = {
  id: "dining",
  icon: "🍽️",
  name: "Trattoria MARE",
  brand: "MARE",
  tagline: "記念日も、いつもの一杯も。",
  since: "港町のイタリアン",
  area: "東京都港区",
  phone: "03-3456-7890",
  address: "東京都港区海岸2-7-3",
  access: "ゆりかもめ日の出駅から徒歩3分",
  hours: "火〜日 11:30〜22:00",
  closed: "月曜",

  serviceWord: "コース",
  customFields: [
    { key: "carModel", label: "ご来店人数", placeholder: "例）大人2名" },
    { key: "carPlate", label: "席のご希望（任意）", placeholder: "例）窓際／個室" },
  ],

  heroLead:
    "旬の食材を使ったコース料理と厳選ワイン。記念日のディナーから気軽なランチまで、海辺のテーブルでお楽しみください。",
  reasonsHeading: "MAREが選ばれる理由",
  reasons: [
    { icon: "🍝", title: "旬のコース料理", desc: "市場直送の食材を使った季節替わりのコースをご用意。" },
    { icon: "🍷", title: "ソムリエ厳選ワイン", desc: "料理に合わせた一杯を、グラスからお選びいただけます。" },
    { icon: "🎉", title: "記念日対応", desc: "個室・サプライズプレートなど、特別な日のご相談も承ります。" },
    { icon: "📱", title: "24時間ネット予約", desc: "スマホからいつでも席のご予約OK。前日リマインドもお届けします。" },
  ],
  qualityBand: {
    heading: "特別な日の予約も、\nお気軽にご相談を。",
    body: "記念日・接待・少人数の宴会など、人数やご要望に合わせて席をご用意します。アレルギー対応もご相談ください。",
    cta: "席を予約する →",
    stats: [
      { n: "個室", l: "あり" },
      { n: "記念日", l: "対応" },
      { n: "ワイン", l: "豊富" },
    ],
  },
  priceHeading: "コース・ご予約メニュー",
  priceNote: "表示価格は目安です。コース内容・人数により変動します。",
  ctaHeading: "席のご予約はWebから24時間",
  ctaBody: "コースと日時を選ぶだけ。最短1分で予約完了です。",
  metaTitle: "イタリアンレストランのWeb予約",
  metaDescription:
    "東京都港区のイタリアンレストラン。ランチ・ディナーコース・個室のご予約をWebから24時間受付しています。",

  timezone: TZ,
  slotInterval: 30,
  capacity: 8,
  openMin: 11 * 60 + 30,
  closeMin: 22 * 60,
  closedWeekdays: [1],
  services: [
    { name: "ランチコース", durationMin: 90, price: 2200, color: "#ea580c", sortOrder: 1, description: "前菜・パスタ・ドルチェの3皿" },
    { name: "ディナーコース", durationMin: 120, price: 5500, color: "#dc2626", sortOrder: 2, description: "季節のフルコース全6品" },
    { name: "アラカルト（席のみ予約）", durationMin: 120, price: 0, color: "#2563eb", sortOrder: 3, description: "お料理は当日メニューから（席のみ確保）" },
    { name: "個室ディナー", durationMin: 150, price: 7700, color: "#7c3aed", sortOrder: 4, description: "記念日・接待向けの個室コース" },
    { name: "貸切・宴会のご相談", durationMin: 60, price: null, color: "#64748b", sortOrder: 5, description: "人数・ご予算に応じてご提案します。" },
  ],
  demoFields: { carModel: "大人2名", carPlate: "窓際希望" },
};

const PRESETS: Record<string, Preset> = { generic, auto, salon, clinic, dining };

/** 環境変数 NEXT_PUBLIC_INDUSTRY で選んだ業種プリセットを返す（未設定なら generic） */
export function getActivePreset(): Preset {
  const id = process.env.NEXT_PUBLIC_INDUSTRY?.trim();
  return (id && PRESETS[id]) || generic;
}
