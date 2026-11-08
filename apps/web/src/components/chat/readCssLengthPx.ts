/** Resolved CSS lengths from getComputedStyle: registered properties are px, unregistered ones stay rem. */
export function readCssLengthPx(value: string, rootFontSizePx: number): number {
  const trimmed = value.trim();
  const matched = /^(-?(?:\d+|\d*\.\d+))(px|rem)$/.exec(trimmed);
  if (!matched) return Number.NaN;
  const amount = Number(matched[1]);
  return matched[2] === "px" ? amount : amount * rootFontSizePx;
}
