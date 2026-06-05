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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/70">
          <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg tracking-tight text-gray-900"
            >
              <span className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                🚗
              </span>
              <span>
                Auto<span className="text-blue-600">Reserve</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2 text-sm">
              <Link
                href="/book"
                className="px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                予約する
              </Link>
              <Link
                href="/booking"
                className="px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                予約確認
              </Link>
              <Link
                href="/admin"
                className="px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition"
              >
                管理
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-slate-900 text-gray-400">
          <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500">
                🚗
              </span>
              AutoReserve
            </div>
            <p className="text-xs">
              自動車整備向け 予約システム（ポートフォリオデモ）
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
