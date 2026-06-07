import { PrismaClient } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { getActivePreset } from "../src/lib/preset";

const prisma = new PrismaClient();
const PRESET = getActivePreset();
const TZ = PRESET.timezone;

function jstDate(dateStr: string, minutes = 0): Date {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return fromZonedTime(`${dateStr}T${hh}:${mm}:00`, TZ);
}

function dateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: TZ }); // yyyy-MM-dd
}

// 選択中の業種プリセットからメニュー・店舗情報を取得（NEXT_PUBLIC_INDUSTRY で切替）
const SERVICES = PRESET.services;

const SHOP_DATA = {
  name: PRESET.name,
  phone: PRESET.phone,
  address: PRESET.address,
  timezone: PRESET.timezone,
  slotInterval: PRESET.slotInterval,
  capacity: PRESET.capacity,
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

  // 営業時間（プリセットの開閉時刻・定休曜日から生成）
  const hours = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    hours.push({
      shopId: shop.id,
      weekday,
      openMin: PRESET.openMin,
      closeMin: PRESET.closeMin,
      isClosed: PRESET.closedWeekdays.includes(weekday),
    });
  }
  await prisma.businessHour.createMany({ data: hours });

  return shop;
}

// メニューを名前で照合し、無いものだけ追加（既存データは消さない・重複させない）
async function ensureServices() {
  const created: { id: string }[] = [];
  for (const s of SERVICES) {
    const found = await prisma.service.findFirst({ where: { name: s.name } });
    created.push(found ?? (await prisma.service.create({ data: s })));
  }
  return created;
}

// デモ用の予約・キャンセル待ち（予約がまだ1件も無いときだけ投入）
async function ensureDemo(services: { id: string }[]) {
  const count = await prisma.booking.count();
  if (count > 0 || services.length === 0) return;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 3600 * 1000);
  const demo = PRESET.demoFields ?? {};

  const first = services[0];
  const second = services[Math.min(1, services.length - 1)];
  const last = services[services.length - 1];

  await prisma.booking.create({
    data: {
      code: "BK-DEMO01",
      serviceId: first.id,
      customerName: "山田 太郎",
      customerEmail: "taro@example.com",
      customerPhone: "090-1111-2222",
      carModel: demo.carModel ?? null,
      carPlate: demo.carPlate ?? null,
      startAt: jstDate(dateStr(tomorrow), PRESET.openMin + 60),
      endAt: jstDate(dateStr(tomorrow), PRESET.openMin + 90),
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      code: "BK-DEMO02",
      serviceId: second.id,
      customerName: "鈴木 花子",
      customerEmail: "hanako@example.com",
      customerPhone: "090-3333-4444",
      carModel: demo.carModel ?? null,
      startAt: jstDate(dateStr(dayAfter), PRESET.openMin + 180),
      endAt: jstDate(dateStr(dayAfter), PRESET.openMin + 270),
      status: "CONFIRMED",
    },
  });

  await prisma.waitlistEntry.create({
    data: {
      serviceId: last.id,
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
  console.log(`Seeding... (industry: ${PRESET.id})`);
  const shop = await ensureShop();
  const services = await ensureServices();
  await ensureDemo(services);
  console.log("Seed completed:");
  console.log(`  shop: ${shop.name}`);
  console.log(`  services ensured: ${services.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
