import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import BookingFlow, { type Service } from "./BookingFlow";

// ビルド時のプリレンダーを避け、リクエスト時にサーバーでメニューを読み込む
export const dynamic = "force-dynamic";

// メニューはほぼ固定なので 5 分キャッシュ（初期表示を高速化）
const getServices = unstable_cache(
  async (): Promise<Service[]> =>
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        price: true,
        color: true,
      },
    }),
  ["active-services"],
  { revalidate: 300, tags: ["services"] },
);

export default async function BookPage() {
  const services = await getServices();

  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
      <BookingFlow initialServices={services} />
    </Suspense>
  );
}
