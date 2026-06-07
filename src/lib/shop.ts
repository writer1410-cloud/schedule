import { getActivePreset } from "./preset";
export type { Preset, CustomField } from "./preset";

// 表示中の業種プリセット（店名・用語・追加入力欄・トップ文言など）。
// 業種の切替は環境変数 NEXT_PUBLIC_INDUSTRY で行う（src/lib/preset.ts を参照）。
export const SHOP = getActivePreset();
