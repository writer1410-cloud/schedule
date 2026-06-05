/** 料金表示。固定額ではなく「〜」付きの目安表記にする */
export function priceLabel(price: number | null): string {
  if (price === null) return "ご相談";
  if (price === 0) return "別途見積";
  return `¥${price.toLocaleString()}〜`;
}
