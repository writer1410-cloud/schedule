// 顧客向けの公開予約番号を生成する（例: BK-7F3K9Q）
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい文字(0,O,1,I)を除外

export function generateBookingCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `BK-${s}`;
}
