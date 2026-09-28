"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { RedPenCircle } from "@/components/ui/RedPenCircle";
import { TextInput } from "@/components/ui/TextInput";
import { cx } from "@/lib/cx";
import {
  MAX_NAME_LENGTH,
  MAX_NAMES,
  addNames,
  clearNames,
  removeName,
  undoRemoval,
  useLastRemoval,
  useNames,
  type Removal,
} from "@/lib/names";
import { NameChip } from "./NameChip";

/** How long a removal can be undone. */
const UNDO_MS = 6000;

type Notice = { text: string } | { removal: Removal };

/**
 * The shared names list, styled as an index card. Every picker shows it; the
 * list itself lives in lib/names so it carries over between pickers.
 */
export function NamesCard({
  highlight = null,
  locked = false,
  className,
}: {
  /** A name to circle in red pen: the latest pick. */
  highlight?: string | null;
  /** Freeze editing while a pick is in progress so the list can't shift under it. */
  locked?: boolean;
  className?: string;
}) {
  const t = useTranslations("names");
  const names = useNames();
  const removal = useLastRemoval();
  const [draft, setDraft] = useState("");
  // What the line under the input says instead of the hint: the latest thing that happened.
  const [notice, setNotice] = useState<Notice | null>(null);
  const [seenRemoval, setSeenRemoval] = useState(removal);
  // Keeps the undo offer up while it has keyboard focus.
  const [holdingUndo, setHoldingUndo] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const inputId = useId();
  const noticeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // A removed or restored chip takes its button with it (or brings one back);
  // this is the list position keyboard focus moves to once the list re-renders.
  const focusSlot = useRef<number | null>(null);

  // Names are removed here and from the result dialogs; either way, offer an undo.
  if (removal !== seenRemoval) {
    setSeenRemoval(removal);
    if (removal) {
      setNotice({ removal });
      setHoldingUndo(false);
    } else if (notice && "removal" in notice) setNotice(null);
  }

  const undoing = notice !== null && "removal" in notice;
  useEffect(() => {
    // A pick in progress pauses the offer, so it's still there when the pick ends.
    if (!undoing || holdingUndo || locked) return;
    const timer = setTimeout(() => setNotice(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [notice, undoing, holdingUndo, locked]);

  useEffect(() => {
    const slot = focusSlot.current;
    if (slot === null) return;
    focusSlot.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[data-remove]");
    if (buttons?.length) buttons[Math.min(slot, buttons.length - 1)].focus();
    else inputRef.current?.focus();
  }, [names]);

  // Circle the pick where it can be seen, even far down a long list on a phone.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector("[data-picked]");
    if (!list || !item) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    if (itemBox.top < listBox.top || itemBox.bottom > listBox.bottom) {
      // Scrolls only the list; scrollIntoView could move the page too.
      list.scrollTop += itemBox.top - listBox.top - (listBox.height - itemBox.height) / 2;
    }
  }, [highlight]);

  function submit(text: string) {
    const result = addNames(text);
    if (result.duplicates.length > 0) {
      setNotice({ text: t("duplicate", { names: result.duplicates.join(", "), count: result.duplicates.length }) });
    } else if (result.overflow.length > 0) {
      setNotice({ text: t("full", { max: MAX_NAMES }) });
    } else if (result.added.length > 0) {
      setNotice({ text: t("added", { count: result.added.length, name: result.added[0] }) });
    }
    return result.added.length > 0;
  }

  function addDraft() {
    if (!locked && draft.trim() && submit(draft)) setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter also confirms Korean/Japanese IME composition; don't add half a word.
    if (event.key !== "Enter" || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    addDraft();
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!/[\n,\t]/.test(text)) return;
    event.preventDefault();
    submit(text);
  }

  function clear() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    setConfirmingClear(false);
    setNotice(null);
    clearNames();
    // The button goes with the list; carry on from the input.
    inputRef.current?.focus();
  }

  function undo(removed: Removal) {
    focusSlot.current = removed.index;
    setNotice(null);
    setHoldingUndo(false);
    undoRemoval(removed);
  }

  return (
    <Card
      title={t("title")}
      className={className}
      extra={
        <>
          <span className="text-sm text-ink-soft">{t("count", { count: names.length })}</span>
          {names.length > 0 && (
            <button
              type="button"
              onClick={clear}
              onBlur={() => setConfirmingClear(false)}
              // Hidden rather than unmounted while locked, so nothing shifts mid-pick.
              className={cx(
                "ml-auto rounded px-1 text-sm underline-offset-4 hover:underline",
                confirmingClear ? "font-bold text-ink" : "text-ink-soft",
                locked && "invisible",
              )}
            >
              {confirmingClear ? t("confirmClear") : t("clear")}
            </button>
          )}
        </>
      }
    >
      <div className="mt-4 flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t("inputLabel")}
        </label>
        <TextInput
          ref={inputRef}
          id={inputId}
          // Where focus goes when the control that had it disappears, e.g. a result dialog's opener.
          data-names-input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={locked}
          maxLength={MAX_NAME_LENGTH}
          placeholder={t("placeholder")}
          aria-describedby={noticeId}
          enterKeyHint="done"
          className="flex-1"
        />
        <button
          type="button"
          onClick={addDraft}
          // aria-disabled, not disabled: an empty draft right after adding would otherwise drop focus.
          aria-disabled={locked || !draft.trim()}
          className="sketch-sm grid size-11 shrink-0 place-items-center border-2 border-ink bg-ink text-paper aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
        >
          <PlusIcon className="size-6" />
          <span className="sr-only">{t("add")}</span>
        </button>
      </div>
      {/* Two lines tall, so a longer or shorter notice doesn't move the list. */}
      <p id={noticeId} aria-live="polite" className={cx("mt-2 min-h-10 text-sm", notice ? "text-ink" : "text-ink-soft")}>
        {notice === null ? (
          t("hint")
        ) : "text" in notice ? (
          notice.text
        ) : (
          <>
            {t("removed", { name: notice.removal.name })}{" "}
            <button
              type="button"
              onClick={() => undo(notice.removal)}
              onFocus={() => setHoldingUndo(true)}
              onBlur={() => setHoldingUndo(false)}
              // Like the chips' ×: restoring a name mid-pick would shift the list under it.
              className={cx("-my-1 rounded px-1 py-1 font-bold underline underline-offset-4", locked && "invisible")}
            >
              {t("undo")}
            </button>
          </>
        )}
        {/* The button's new label alone often goes unannounced. */}
        {confirmingClear && <span className="sr-only">{t("confirmClear")}</span>}
      </p>

      {names.length === 0 ? (
        <p className="mt-3 text-ink-soft">{t("empty")}</p>
      ) : (
        <ul
          ref={listRef}
          className="-mx-3 mt-1 flex max-h-48 flex-wrap content-start gap-x-2 gap-y-3 overflow-y-auto p-3 lg:max-h-88"
        >
          {names.map((name, index) => (
            <li key={name} data-picked={name === highlight || undefined} className="max-w-full">
              <RedPenCircle active={name === highlight} seed={name} className="max-w-full">
                <NameChip name={name} index={index} count={names.length} className="pr-1">
                  <button
                    type="button"
                    data-remove
                    onClick={() => {
                      focusSlot.current = index;
                      removeName(name);
                    }}
                    // Hidden rather than unmounted while locked, so chips keep their width.
                    className={cx(
                      "grid size-8 shrink-0 place-items-center rounded-full hover:bg-on-marker/10",
                      locked && "invisible",
                    )}
                  >
                    <CloseIcon className="size-4" />
                    <span className="sr-only">{t("remove", { name })}</span>
                  </button>
                </NameChip>
              </RedPenCircle>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
