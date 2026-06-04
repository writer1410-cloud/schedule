import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoReserve｜自動車整備の予約システム",
  description:
    "自動車販売・整備業者向けの予約／日程調整／前日リマインド／キャンセル待ち自動化システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-blue-700">
              🚗 AutoReserve
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/book" className="text-gray-600 hover:text-blue-700">
                予約する
              </Link>
              <Link
                href="/booking"
                className="text-gray-600 hover:text-blue-700"
              >
                予約確認
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-700">
                管理
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-500">
            AutoReserve — 自動車整備向け予約システム（ポートフォリオデモ）
          </div>
        </footer>
      </body>
    </html>
  );
}
