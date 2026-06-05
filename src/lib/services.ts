import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number | null;
  color: string;
};

// 公開中の整備メニュー。ほぼ固定なので 5 分キャッシュ（初期表示を高速化）
export const getActiveServices = unstable_cache(
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
