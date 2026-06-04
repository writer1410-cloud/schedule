// 前日リマインドをコマンドラインから実行するスクリプト。
//   npm run reminders
// cron 例（毎日 18:00 に翌日分を送信）:
//   0 18 * * *  cd /path/to/app && npm run reminders >> reminders.log 2>&1
import { sendDueReminders } from "../src/lib/bookings";
import { prisma } from "../src/lib/db";

async function main() {
  const results = await sendDueReminders();
  const ok = results.filter((r) => r.ok).length;
  console.log(`Reminders: ${ok}/${results.length} sent`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
