import { useState } from "react";
import { expect, it, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";

import "~/index.css";

import { render } from "../../../test/render";
import {
  ADD_PROJECT_VALUE,
  DraftHeroPickerItemRow,
  DraftHeroProjectPicker,
  NO_PROJECT_VALUE,
  type DraftHeroPickerItem,
} from "./DraftHeroProjectPicker";

function Picker({
  label = "server",
  showNoProject = false,
  onClear = () => {},
  onSelect = () => {},
}: {
  readonly label?: string;
  readonly showNoProject?: boolean;
  readonly onClear?: () => void;
  readonly onSelect?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const projects: readonly DraftHeroPickerItem[] = [
    { value: "server", label },
    { value: "other", label: "other" },
  ];
  const items = [...projects, { value: ADD_PROJECT_VALUE, label: "Add project" }];
  const filtered =
    query.trim().length === 0
      ? items
      : items.filter(
          (item) => item.value !== ADD_PROJECT_VALUE && item.label.toLowerCase().includes(query),
        );
  return (
    <DraftHeroProjectPicker
      variant="heading"
      items={items}
      filteredItems={
        showNoProject ? [...filtered, { value: NO_PROJECT_VALUE, label: "No project" }] : filtered
      }
      selectedItem={projects[0] ?? null}
      label={label}
      open={open}
      query={query}
      showClear
      showNameTooltip={false}
      clearShortcutLabel="Ctrl+Alt+N"
      onOpenChange={setOpen}
      onQueryChange={setQuery}
      onHighlight={() => {}}
      onSearchKeyDown={() => {}}
      onSelect={(value) => {
        setOpen(false);
        onSelect(value);
      }}
      onClear={onClear}
      renderItem={(item) => <DraftHeroPickerItemRow key={item.value} item={item} />}
    />
  );
}

it("keeps the project name still when the clear control appears", async () => {
  await using screen = await render(<Picker />);
  const name = screen.getByRole("combobox", { name: "server" });
  const clear = screen.getByRole("button", { name: "Clear selected project" });
  const before = name.element().getBoundingClientRect();

  await userEvent.hover(name);
  const after = name.element().getBoundingClientRect();

  expect(after.x).toBe(before.x);
  expect(after.width).toBe(before.width);
  expect(name.element().contains(clear.element())).toBe(false);
  expect(clear.element().closest("button")).toBe(clear.element());
  expect(clear.element().className).toContain("motion-reduce:transition-none");
  expect(clear.element().className).toContain("pointer-fine:inline-flex");
});

it("clears from the button without opening the project menu", async () => {
  const onClear = vi.fn();
  await using screen = await render(<Picker onClear={onClear} />);

  await userEvent.click(screen.getByRole("button", { name: "Clear selected project" }));

  expect(onClear).toHaveBeenCalledOnce();
  expect(page.getByRole("listbox").elements()).toHaveLength(0);
  expect(page.getByRole("dialog").elements()).toHaveLength(0);
});

it("reaches clear from the keyboard", async () => {
  const onClear = vi.fn();
  await using screen = await render(<Picker onClear={onClear} />);
  screen.getByRole("combobox", { name: "server" }).element().focus();

  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Clear selected project" }).element(),
  );
  await userEvent.keyboard("{Enter}");

  expect(onClear).toHaveBeenCalledOnce();
  expect(page.getByRole("listbox").elements()).toHaveLength(0);
  expect(page.getByRole("dialog").elements()).toHaveLength(0);
});

it("offers No project last, including while searching, and can reselect a project", async () => {
  const onSelect = vi.fn();
  await using screen = await render(<Picker showNoProject onSelect={onSelect} />);

  await userEvent.click(screen.getByRole("combobox", { name: "server" }));
  const options = () => page.getByRole("option").elements();
  expect(options().at(-1)?.textContent).toContain("No project");

  await userEvent.type(page.getByRole("combobox", { name: "Search projects" }), "zzz");
  expect(options().map((option) => option.textContent?.trim())).toEqual(["No project"]);

  await userEvent.click(page.getByRole("option", { name: "No project" }));
  expect(onSelect).toHaveBeenCalledWith(NO_PROJECT_VALUE);

  await userEvent.click(screen.getByRole("combobox", { name: "server" }));
  await userEvent.click(page.getByRole("option", { name: "other" }));
  expect(onSelect).toHaveBeenLastCalledWith("other");
});

it("truncates a long project name instead of overflowing its heading", async () => {
  const container = document.createElement("div");
  container.style.width = "140px";
  await using screen = await render(
    <Picker label="an-extremely-long-project-name-that-must-truncate" />,
    { container },
  );

  expect(screen.container.scrollWidth).toBeLessThanOrEqual(screen.container.clientWidth + 1);
});
