import { PrismaClient } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();
const TZ = "Asia/Tokyo";

function jstDate(dateStr: string, minutes = 0): Date {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return fromZonedTime(`${dateStr}T${hh}:${mm}:00`, TZ);
}

function dateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: TZ }); // yyyy-MM-dd
}

// 整備メニュー（正準リスト）。価格は「〜」表記の目安。その他は料金未定（ご相談）
const SERVICES: {
  name: string;
  durationMin: number;
  price: number | null;
  color: string;
  sortOrder: number;
  description: string;
}[] = [
  { name: "オイル交換", durationMin: 30, price: 4400, color: "#16a34a", sortOrder: 1, description: "エンジンオイル＋エレメント交換" },
  { name: "タイヤ交換・履き替え", durationMin: 60, price: 6600, color: "#2563eb", sortOrder: 2, description: "タイヤ4本の脱着・バランス調整" },
  { name: "12ヶ月点検", durationMin: 90, price: 13200, color: "#7c3aed", sortOrder: 3, description: "法定12ヶ月点検（一般整備）" },
  { name: "車検", durationMin: 120, price: 0, color: "#dc2626", sortOrder: 4, description: "継続車検（料金は車種により別途見積）" },
  { name: "バッテリー交換", durationMin: 30, price: 3300, color: "#ea580c", sortOrder: 5, description: "バッテリーの点検・交換" },
  { name: "その他（修理のご相談など）", durationMin: 30, price: null, color: "#0891b2", sortOrder: 6, description: "気になる不具合や修理のご相談。内容に応じてお見積りいたします。" },
];

const SHOP_DATA = {
  name: "みなと自動車整備工場",
  phone: "03-5775-1234",
  address: "東京都港区芝浦3-14-5",
  timezone: TZ,
  slotInterval: 30,
  capacity: 2, // ピット2基相当
};

// 店舗（シングルトン）を用意。無ければ作成＋営業時間も作成、有れば表示情報を最新化
async function ensureShop() {
  const existing = await prisma.shop.findFirst();
  if (existing) {
    return prisma.shop.update({
      where: { id: existing.id },
      data: {
        name: SHOP_DATA.name,
        phone: SHOP_DATA.phone,
        address: SHOP_DATA.address,
      },
    });
  }

  const shop = await prisma.shop.create({ data: SHOP_DATA });

  // 営業時間: 月〜土 9:00-18:00、日曜定休
  const hours = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    hours.push({
      shopId: shop.id,
      weekday,
      openMin: 9 * 60,
      closeMin: 18 * 60,
      isClosed: weekday === 0,
    });
  }
  await prisma.businessHour.createMany({ data: hours });

  return shop;
}

// メニューを名前で照合し、無いものだけ追加（既存データは消さない・重複させない）
async function ensureServices() {
  const byName: Record<string, { id: string }> = {};
  for (const s of SERVICES) {
    const found = await prisma.service.findFirst({ where: { name: s.name } });
    byName[s.name] = found ?? (await prisma.service.create({ data: s }));
  }
  return byName;
}

// デモ用の予約・キャンセル待ち（予約がまだ1件も無いときだけ投入）
async function ensureDemo(byName: Record<string, { id: string }>) {
  const count = await prisma.booking.count();
  if (count > 0) return;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 3600 * 1000);

  await prisma.booking.create({
    data: {
      code: "BK-DEMO01",
      serviceId: byName["オイル交換"].id,
      customerName: "山田 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "090-1111-2222",
      carModel: "トヨタ プリウス",
      carPlate: "品川 300 あ 12-34",
      startAt: jstDate(dateStr(tomorrow), 10 * 60),
      endAt: jstDate(dateStr(tomorrow), 10 * 60 + 30),
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      code: "BK-DEMO02",
      serviceId: byName["12ヶ月点検"].id,
      customerName: "鈴木 花子",
      customerEmail: "hanako@example.com",
      customerPhone: "090-3333-4444",
      carModel: "ホンダ フィット",
      startAt: jstDate(dateStr(dayAfter), 13 * 60),
      endAt: jstDate(dateStr(dayAfter), 13 * 60 + 90),
      status: "CONFIRMED",
    },
  });

  await prisma.waitlistEntry.create({
    data: {
      serviceId: byName["車検"].id,
      customerName: "佐藤 次郎",
      customerEmail: "jiro@example.com",
      customerPhone: "090-5555-6666",
      desiredDate: jstDate(dateStr(tomorrow), 0),
      note: "午前中希望",
      status: "WAITING",
    },
  });
}

async function main() {
  console.log("Seeding...");
  const shop = await ensureShop();
  const services = await ensureServices();
  await ensureDemo(services);
  console.log("Seed completed:");
  console.log(`  shop: ${shop.name}`);
  console.log(`  services ensured: ${Object.keys(services).length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
