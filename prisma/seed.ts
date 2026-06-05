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

async function main() {
  console.log("Seeding...");

  // 既に初期データがあればスキップ（再デプロイ時のデータ消去・重複を防止）
  const existing = await prisma.shop.findFirst();
  if (existing) {
    console.log("Seed skipped: shop already exists");
    return;
  }

  // 店舗（シングルトン）
  const shop = await prisma.shop.create({
    data: {
      name: "サンプル自動車整備工場",
      phone: "03-1234-5678",
      address: "東京都千代田区サンプル1-2-3",
      timezone: TZ,
      slotInterval: 30,
      capacity: 2, // ピット2基相当
    },
  });

  // 営業時間: 月〜土 9:00-18:00、日曜定休
  const hours = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const isSunday = weekday === 0;
    hours.push({
      shopId: shop.id,
      weekday,
      openMin: 9 * 60,
      closeMin: 18 * 60,
      isClosed: isSunday,
    });
  }
  await prisma.businessHour.createMany({ data: hours });

  // 整備メニュー
  const services = await Promise.all(
    [
      { name: "オイル交換", durationMin: 30, price: 4400, color: "#16a34a", sortOrder: 1, description: "エンジンオイル＋エレメント交換" },
      { name: "タイヤ交換・履き替え", durationMin: 60, price: 6600, color: "#2563eb", sortOrder: 2, description: "タイヤ4本の脱着・バランス調整" },
      { name: "12ヶ月点検", durationMin: 90, price: 13200, color: "#7c3aed", sortOrder: 3, description: "法定12ヶ月点検（一般整備）" },
      { name: "車検", durationMin: 120, price: 0, color: "#dc2626", sortOrder: 4, description: "継続車検（料金は車種により別途見積）" },
      { name: "バッテリー交換", durationMin: 30, price: 3300, color: "#ea580c", sortOrder: 5, description: "バッテリーの点検・交換" },
    ].map((s) => prisma.service.create({ data: s })),
  );

  // デモ用予約（明日と明後日）
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 3600 * 1000);

  await prisma.booking.create({
    data: {
      code: "BK-DEMO01",
      serviceId: services[0].id,
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
      serviceId: services[2].id,
      customerName: "鈴木 花子",
      customerEmail: "hanako@example.com",
      customerPhone: "090-3333-4444",
      carModel: "ホンダ フィット",
      startAt: jstDate(dateStr(dayAfter), 13 * 60),
      endAt: jstDate(dateStr(dayAfter), 13 * 60 + 90),
      status: "CONFIRMED",
    },
  });

  // デモ用キャンセル待ち
  await prisma.waitlistEntry.create({
    data: {
      serviceId: services[3].id, // 車検
      customerName: "佐藤 次郎",
      customerEmail: "jiro@example.com",
      customerPhone: "090-5555-6666",
      desiredDate: jstDate(dateStr(tomorrow), 0),
      note: "午前中希望",
      status: "WAITING",
    },
  });

  console.log("Seed completed:");
  console.log(`  shop: ${shop.name}`);
  console.log(`  services: ${services.length}`);
  console.log(`  demo bookings: 2, waitlist: 1`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
