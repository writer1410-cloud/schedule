import { Suspense } from "react";
import { getActiveServices } from "@/lib/services";
import { SHOP } from "@/lib/shop";
import BookingFlow from "./BookingFlow";

// ビルド時のプリレンダーを避け、リクエスト時にサーバーでメニューを読み込む
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const services = await getActiveServices();

  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中…</p>}>
      <BookingFlow
        initialServices={services}
        customFields={SHOP.customFields}
        serviceWord={SHOP.serviceWord}
      />
    </Suspense>
  );
}
