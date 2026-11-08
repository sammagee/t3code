import { useState } from "react";
import { expect, it, vi } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import "~/index.css";

import { render } from "../../../test/render";
import { ComposerCommandMenuLayer } from "./ComposerCommandMenuLayer";
import { ComposerSurface } from "./ComposerSurface";
import { readCssLengthPx } from "./readCssLengthPx";

function ComposerWithMenu() {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <ComposerSurface.Shell>
        <form data-chat-composer-form="true" style={{ width: 640 }}>
          <ComposerSurface.Host>
            <ComposerSurface.Main>
              <div ref={setAnchor} data-chat-composer-body="true" className="h-24" />
            </ComposerSurface.Main>
          </ComposerSurface.Host>
        </form>
      </ComposerSurface.Shell>
      <ComposerCommandMenuLayer anchor={anchor}>
        <div role="listbox" aria-label="Commands">
          plan
        </div>
      </ComposerCommandMenuLayer>
    </>
  );
}

function composerLengths(form: HTMLElement) {
  const style = getComputedStyle(form);
  const rootFontSizePx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const read = (name: string) => {
    const value = style.getPropertyValue(name).trim();
    return { value, px: readCssLengthPx(value, rootFontSizePx) };
  };
  return {
    drawer: read("--chat-composer-drawer-inset"),
    overlap: read("--chat-composer-attachment-overlap"),
    outer: read("--composer-radius-outer"),
  };
}

it("positions the command menu from resolved composer lengths", async () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  await page.viewport(1280, 800);
  await using _viewport = {
    [Symbol.asyncDispose]: async () => {
      document.documentElement.style.fontSize = "";
      await page.viewport(viewport.width, viewport.height);
    },
  };
  await using screen = await render(<ComposerWithMenu />);
  const menu = page.getByRole("listbox", { name: "Commands" });
  await expect.element(menu).toBeVisible();

  const form = screen.container.querySelector("form");
  const surface = form?.querySelector<HTMLElement>('[data-chat-composer-main-surface="true"]');
  if (!form || !surface) throw new Error("composer surface missing");
  const layer = document.querySelector<HTMLElement>('[data-composer-drawer-layer="true"]');
  if (!layer) throw new Error("command menu layer missing");

  const desktop = composerLengths(form);
  expect(desktop.drawer.value).toMatch(/^-?\d+(\.\d+)?px$/);
  expect(desktop.overlap.value).toMatch(/^-?\d+(\.\d+)?px$/);
  expect(desktop.outer.value).toMatch(/^-?\d+(\.\d+)?px$/);
  expect(desktop.drawer.px).toBeCloseTo(31, 1);
  expect(desktop.overlap.px).toBeCloseTo(26, 1);
  expect(desktop.outer.px).toBeCloseTo(25, 1);

  const rect = surface.getBoundingClientRect();
  const box = layer.getBoundingClientRect();
  expect(box.left).toBeCloseTo(rect.left + desktop.drawer.px, 0);
  expect(box.width).toBeCloseTo(rect.width - desktop.drawer.px * 2, 0);
  expect(Number.parseFloat(layer.style.bottom)).toBeCloseTo(
    window.innerHeight - rect.top - desktop.overlap.px,
    0,
  );

  document.documentElement.style.fontSize = "20px";
  window.dispatchEvent(new Event("resize"));
  await vi.waitFor(() => {
    const scaled = composerLengths(form);
    const scaledRect = surface.getBoundingClientRect();
    const scaledLayer = document.querySelector<HTMLElement>('[data-composer-drawer-layer="true"]');
    expect(scaled.drawer.value).toMatch(/^-?\d+(\.\d+)?px$/);
    expect(scaled.drawer.px).toBeCloseTo(38.5, 1);
    expect(scaled.overlap.px).toBeCloseTo(32, 1);
    expect(scaled.outer.px).toBeCloseTo(31, 1);
    expect(scaledLayer?.getBoundingClientRect().left).toBeCloseTo(
      scaledRect.left + scaled.drawer.px,
      0,
    );
    expect(scaledLayer?.getBoundingClientRect().width).toBeCloseTo(
      scaledRect.width - scaled.drawer.px * 2,
      0,
    );
  });
});
