import { CircleOffIcon, FolderPlusIcon, XIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

import { DraftProjectName } from "./DraftProjectName";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxSearchInput,
  ComboboxTrigger,
} from "../ui/combobox";
import { InlineButton } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

export const ADD_PROJECT_VALUE = "add-project";
export const NO_PROJECT_VALUE = "no-project";

export interface DraftHeroPickerItem {
  readonly value: string;
  readonly label: string;
}

export function DraftHeroPickerItemRow({
  item,
  icon,
  children,
}: {
  readonly item: DraftHeroPickerItem;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
}) {
  return (
    <ComboboxItem hideIndicator value={item}>
      {icon}
      <Tooltip>
        <TooltipTrigger render={<span className="min-w-0 flex-1 text-sm" />}>
          <DraftProjectName value={item.label} />
        </TooltipTrigger>
        <TooltipPopup side="top">{item.label}</TooltipPopup>
      </Tooltip>
      {children}
    </ComboboxItem>
  );
}

function ProjectNameTrigger({
  label,
  heading,
  showTooltip,
}: {
  readonly label: string;
  readonly heading: boolean;
  readonly showTooltip: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ComboboxTrigger
            render={heading ? <button type="button" /> : <InlineButton tone="picker" />}
            aria-label={label}
            data-draft-project-trigger=""
            className={
              heading
                ? "pointer-events-auto min-w-0 max-w-full cursor-pointer"
                : "pointer-events-auto min-w-0 max-w-full align-baseline"
            }
          />
        }
      >
        <DraftProjectName value={label} singleLine />
      </TooltipTrigger>
      {showTooltip ? <TooltipPopup side="top">{label}</TooltipPopup> : null}
    </Tooltip>
  );
}

function ClearSelectedProjectButton({
  shortcutLabel,
  onClear,
}: {
  readonly shortcutLabel: string | null;
  readonly onClear: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Clear selected project"
            data-draft-project-clear=""
            className="hidden size-6 shrink-0 -translate-x-1 items-center justify-center rounded-(--control-radius) text-muted-foreground opacity-0 transition-[opacity,translate] duration-150 pointer-fine:inline-flex hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring motion-reduce:translate-x-0 motion-reduce:transition-none motion-reduce:duration-0 group-focus-within/draft-project:translate-x-0 group-focus-within/draft-project:opacity-100 group-hover/draft-project:translate-x-0 group-hover/draft-project:opacity-100"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }}
          />
        }
      >
        <XIcon className="size-3.5" />
      </TooltipTrigger>
      <TooltipPopup side="top">
        {shortcutLabel ? `Clear selected project (${shortcutLabel})` : "Clear selected project"}
      </TooltipPopup>
    </Tooltip>
  );
}

export function DraftHeroProjectPicker({
  variant,
  items,
  filteredItems,
  selectedItem,
  label,
  open,
  query,
  showClear,
  showNameTooltip,
  clearShortcutLabel,
  onOpenChange,
  onQueryChange,
  onHighlight,
  onSearchKeyDown,
  onSelect,
  onClear,
  renderItem,
}: {
  readonly variant: "heading" | "inline";
  readonly items: readonly DraftHeroPickerItem[];
  readonly filteredItems: readonly DraftHeroPickerItem[];
  readonly selectedItem: DraftHeroPickerItem | null;
  readonly label: string;
  readonly open: boolean;
  readonly query: string;
  readonly showClear: boolean;
  readonly showNameTooltip: boolean;
  readonly clearShortcutLabel: string | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onQueryChange: (query: string) => void;
  readonly onHighlight: (value: string | null) => void;
  readonly onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onSelect: (value: string) => void;
  readonly onClear: () => void;
  readonly renderItem: (item: DraftHeroPickerItem) => ReactNode;
}) {
  const heading = variant === "heading";
  const nameTrigger = (
    <ProjectNameTrigger label={label} heading={heading} showTooltip={showNameTooltip} />
  );

  return (
    <Combobox
      items={items}
      filteredItems={filteredItems}
      autoHighlight
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
      open={open}
      onItemHighlighted={(item) => {
        onHighlight(item?.value ?? null);
      }}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) onQueryChange("");
      }}
      value={selectedItem}
      onValueChange={(item) => {
        if (!item) return;
        onSelect(item.value);
      }}
    >
      {heading ? (
        <span className="group/draft-project inline-flex min-w-0 max-w-full items-center rounded-(--control-radius) ps-1.5 font-medium transition-colors hover:bg-foreground/10 focus-within:bg-foreground/10 has-data-popup-open:bg-foreground/10">
          {nameTrigger}
          {showClear ? (
            <ClearSelectedProjectButton shortcutLabel={clearShortcutLabel} onClear={onClear} />
          ) : null}
        </span>
      ) : (
        nameTrigger
      )}
      <ComboboxPopup align="center" className="w-72 overflow-hidden">
        <ComboboxSearchInput
          aria-label="Search projects"
          placeholder="Search projects..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onSearchKeyDown}
        />
        <ComboboxEmpty>No matching projects.</ComboboxEmpty>
        <ComboboxList>
          {(item: DraftHeroPickerItem) => {
            if (item.value === NO_PROJECT_VALUE) {
              return (
                <DraftHeroPickerItemRow
                  key={item.value}
                  item={item}
                  icon={<CircleOffIcon className="size-4 shrink-0" />}
                />
              );
            }
            if (item.value === ADD_PROJECT_VALUE) {
              return (
                <DraftHeroPickerItemRow
                  key={item.value}
                  item={item}
                  icon={<FolderPlusIcon className="size-4 shrink-0" />}
                />
              );
            }
            return renderItem(item);
          }}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
