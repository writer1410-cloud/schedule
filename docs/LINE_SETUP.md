# LINE 公式アカウント連携 セットアップ手順

この予約システムは LINE 公式アカウントと連携できます。
**環境変数が未設定の間は LINE 連携は自動的に無効**（通知はメールのみ、予約画面は通常の Web 予約）になるため、設定した分だけ段階的に有効化されます。

連携でできること:

- 予約確定・前日リマインド・キャンセル完了・**キャンセル待ちの空き通知**を LINE トークに push
- **LIFF** により LINE アプリ内で予約画面（`/book`）を開き、名前を自動入力して予約
- 友だち追加時のあいさつ、メッセージへの自動応答（予約導線の案内）

---

## 1. LINE 公式アカウント / Messaging API チャネルを作る

1. [LINE Developers](https://developers.line.biz/) にログイン
2. プロバイダーを作成（屋号など）
3. **Messaging API チャネル**を作成（= 公式アカウント）
4. 「Messaging API設定」で **チャネルアクセストークン（長期）** を発行
5. 「チャネル基本設定」で **チャネルシークレット** を控える

環境変数に設定:

```
LINE_CHANNEL_ACCESS_TOKEN="（チャネルアクセストークン）"
LINE_CHANNEL_SECRET="（チャネルシークレット）"
```

> この2つを設定するだけで、**push 通知（確定・リマインド・空き通知など）**が有効になります。
> ただし通知先の LINE ユーザーIDは「LINEから予約した人」だけに紐づくため、効果を出すには手順3のLIFFも設定してください。

## 2. Webhook を登録する

1. 「Messaging API設定」の **Webhook URL** に以下を登録
   ```
   https://<あなたの本番ドメイン>/api/line/webhook
   ```
2. **Webhookの利用** を ON
3. 応答メッセージ（自動応答）は必要に応じて OFF（このアプリ側で返信します）

これで友だち追加時のあいさつ・メッセージへの自動応答が動きます。

## 3. LIFF（LINE 内で予約）を設定する

1. LINE Developers で **LIFF** を追加（Messaging API チャネル、または紐づく LINE Login チャネル）
   - エンドポイントURL: `https://<本番ドメイン>/book`
   - サイズ: `Full`
   - **scope に `profile` と `openid` を含める**（IDトークン取得に必要）
2. 発行された **LIFF ID** と、LIFF が属する**チャネルID**を控える

環境変数に設定:

```
NEXT_PUBLIC_LIFF_ID="（LIFF ID 例: 1234567890-abcdEFGH）"
LINE_LOGIN_CHANNEL_ID="（LIFF が属するチャネルのID＝数字）"
```

> `LINE_LOGIN_CHANNEL_ID` はサーバーが IDトークンを検証する際の `client_id` に使います。
> LIFF を Messaging API チャネルに作った場合はそのチャネルID、LINE Login チャネルに作った場合はそのチャネルIDを指定します。

## 4. リッチメニュー（任意）

LINE Official Account Manager で、トーク下部のリッチメニューに
LIFF の URL（`https://liff.line.me/<LIFF_ID>`）へのリンクボタンを置くと、
ワンタップで予約画面に入れます。

---

## 動作の仕組み（実装メモ）

- 通知: `src/lib/notifications.ts` がメール送信に加え、予約・キャンセル待ちに
  `lineUserId` が紐づいていれば `src/lib/line.ts` の `pushLineMessages` で push します。
- 予約時の紐付け: LIFF 予約では `src/lib/useLiff.ts` が IDトークンを取得し、
  予約/キャンセル待ち API に渡します。サーバーは `verifyLiffIdToken` で検証して
  `lineUserId` を保存します（クライアント申告の userId は信用しません）。
- Webhook: `src/app/api/line/webhook/route.ts` が署名（`X-Line-Signature`）を
  検証してから follow / message に応答します。

## Vercel への設定

Vercel のプロジェクト設定 → Environment Variables に上記キーを追加し、再デプロイしてください。
`NEXT_PUBLIC_LIFF_ID` はクライアントに埋め込まれるため、ビルド時に必要です。
