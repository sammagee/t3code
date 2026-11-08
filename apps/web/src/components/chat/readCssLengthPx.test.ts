import { describe, expect, it } from "vite-plus/test";

import { readCssLengthPx } from "./readCssLengthPx";

describe("readCssLengthPx", () => {
  it("reads px from a registered custom property and rem from an unregistered one", () => {
    expect(readCssLengthPx("26px", 16)).toBe(26);
    expect(readCssLengthPx(" 1.375rem ", 16)).toBe(22);
    expect(readCssLengthPx("calc(1rem + 1px)", 16)).toBeNaN();
  });
});
