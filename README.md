# AutoReserve — 自動車整備向け 予約・日程調整・リマインドシステム

自動車販売・整備業者向けの **予約受付 / 空き枠表示 / Google Calendar 連携 / 前日リマインド / キャンセル待ち** をひとつにまとめた予約システムです。副業・ポートフォリオ用に、手軽に起動できる構成（Next.js + SQLite）で実装しています。

## 主な機能

| 機能 | 説明 |
| --- | --- |
| 予約受付 | メニュー → 日付 → 空き枠 → お客様情報 の 3 ステップで予約完了 |
| 空き枠の自動表示 | 営業時間・作業所要時間・並行受付数（ピット数）・既存予約から自動計算 |
| Google Calendar 連携 | 予約をカレンダーへ登録（抽象化済み。`noop`/`google` を環境変数で切替） |
| 前日リマインド | 来店前日に自動メール通知（cron / スクリプト実行） |
| キャンセル待ち | 満席日でも登録可能。空きが出たら先着の 1 名へ自動メール／LINE 通知 |
| 管理ダッシュボード | 予約一覧・ステータス変更（完了/取消）・キャンセル待ち管理 |
| LINE 公式アカウント連携 | 確定/リマインド/空き通知の LINE push、LIFF で LINE 内予約（設定は [`docs/LINE_SETUP.md`](docs/LINE_SETUP.md)） |

## 技術スタック

- **Next.js 15 (App Router) + TypeScript**
- **Prisma + SQLite**（ファイル DB。設定変更で PostgreSQL 等へ移行可能）
- **Tailwind CSS v4**
- **nodemailer**（メール送信。`console`/`smtp` を切替）
- **Zod**（入力バリデーション）

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数を用意
cp .env.example .env

# 3. DB 作成 + 初期データ投入（店舗・メニュー・デモ予約）
npm run db:push
npm run db:seed

# 4. 開発サーバー起動
npm run dev
# http://localhost:3000
```

### 主要画面

| URL | 内容 |
| --- | --- |
| `/` | ランディング |
| `/book` | 予約フロー（顧客向け） |
| `/booking` → `/booking/[code]` | 予約番号で確認・キャンセル |
| `/waitlist` | キャンセル待ち登録 |
| `/admin` | 管理ダッシュボード（`ADMIN_TOKEN` でログイン） |

開発デフォルトの管理トークンは `.env` の `ADMIN_TOKEN=dev-admin-token` です。

## 前日リマインドの実行

「予約日の前日」に該当する未送信の予約へメールを送ります。1 度送った予約は再送されません。

```bash
# スクリプトで実行
npm run reminders

# HTTP エンドポイントで実行（cron / Vercel Cron 等から）
curl -X POST "http://localhost:3000/api/cron/reminders?secret=$CRON_SECRET"
```

cron 例（毎日 18:00 に翌日分を送信）:

```
0 18 * * *  cd /path/to/app && npm run reminders >> reminders.log 2>&1
```

## 外部連携の有効化

ポートフォリオとしてそのまま動かせるよう、外部連携はデフォルトでモック動作します。実運用では `.env` を切り替えてください。

### メール送信（nodemailer）

```env
MAIL_DRIVER=smtp
MAIL_FROM="○○整備工場 <noreply@example.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

`MAIL_DRIVER=console`（デフォルト）の場合は実送信せず、メール内容をサーバーログに出力します。

### Google Calendar 連携

```env
GOOGLE_CALENDAR_DRIVER=google
GOOGLE_CALENDAR_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
```

連携ロジックは `src/lib/google-calendar.ts` に抽象化済みです。`google` ドライバの実装（`googleapis` 利用）を追加すれば、インターフェースを変えずに本接続できます。デフォルトの `noop` では連携せずログ出力のみ行います。

## ディレクトリ構成

```
prisma/
  schema.prisma     # データモデル（Shop / Service / Booking / WaitlistEntry ...）
  seed.ts           # 初期データ
scripts/
  send-reminders.ts # 前日リマインド実行スクリプト
src/
  lib/
    availability.ts # 空き枠計算・予約枠の最終検証
    bookings.ts     # 予約の作成/キャンセル/リマインド/繰上げ
    notifications.ts# メール文面テンプレート
    email.ts        # メール送信抽象化（console/smtp）
    google-calendar.ts # カレンダー連携抽象化（noop/google）
    time.ts         # タイムゾーン処理
    auth.ts         # 管理トークン認証
    validators.ts   # Zod スキーマ
  app/
    book/           # 予約フロー
    booking/[code]/ # 予約確認・キャンセル
    waitlist/       # キャンセル待ち
    admin/          # 管理ダッシュボード
    api/            # API ルート
```

## データモデル概要

- **Shop**: 店舗設定（営業時間 `BusinessHour`、定休日 `Holiday`、予約枠の刻み `slotInterval`、並行受付数 `capacity`）
- **Service**: 整備メニュー（所要時間・料金・色）
- **Booking**: 予約（公開予約番号 `code`、ステータス、リマインド送信日時、カレンダーイベントID）
- **WaitlistEntry**: キャンセル待ち（希望日・ステータス）

## 今後の拡張余地（ポートフォリオでのアピール材料）

- LINE / SMS リマインド（`notifications.ts` にチャネル追加）
- 複数店舗・スタッフ別予約枠
- Google Calendar 双方向同期
- 決済（前金・キャンセル料）連携
- 予約分析ダッシュボード

> ⚠️ 本リポジトリはポートフォリオ用のデモ実装です。管理画面はトークンによる簡易認証のため、本番運用時は適切な認証基盤への置き換えを推奨します。
