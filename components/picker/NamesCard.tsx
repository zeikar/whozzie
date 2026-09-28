"use client";

import { useId, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { RedPenCircle } from "@/components/ui/RedPenCircle";
import { cx } from "@/lib/cx";
import { MAX_NAME_LENGTH, MAX_NAMES, addNames, clearNames, removeName, useNames } from "@/lib/names";
import { NameChip } from "./NameChip";

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
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const inputId = useId();
  const noticeId = useId();

  function submit(text: string) {
    const result = addNames(text);
    if (result.duplicates.length > 0) {
      setNotice(t("duplicate", { name: result.duplicates.join(", ") }));
    } else if (result.overflow.length > 0) {
      setNotice(t("full", { max: MAX_NAMES }));
    } else {
      setNotice(null);
    }
    return result.added.length > 0;
  }

  function addDraft() {
    if (draft.trim() && submit(draft)) setDraft("");
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

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className={cx("sketch border-2 border-ink bg-card px-5 pt-4 pb-5", className)}
    >
      <header className="flex items-baseline gap-3 border-b-2 border-rule pb-2">
        <h2 id={`${inputId}-title`} className="font-hand text-3xl font-bold">
          {t("title")}
        </h2>
        <span className="text-sm text-ink-soft">{t("count", { count: names.length })}</span>
        {names.length > 0 && !locked && (
          <button
            type="button"
            onClick={() => {
              if (confirmingClear) {
                clearNames();
                setNotice(null);
              }
              setConfirmingClear(!confirmingClear);
            }}
            onBlur={() => setConfirmingClear(false)}
            className={cx(
              "ml-auto rounded px-1 text-sm underline-offset-4 hover:underline",
              confirmingClear ? "text-verdict" : "text-ink-soft",
            )}
          >
            {confirmingClear ? t("confirmClear") : t("clear")}
          </button>
        )}
      </header>

      <div className="mt-4 flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          {t("inputLabel")}
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={locked}
          maxLength={MAX_NAME_LENGTH}
          placeholder={t("placeholder")}
          aria-describedby={noticeId}
          autoComplete="off"
          enterKeyHint="done"
          className={
            "sketch-sm h-11 min-w-0 flex-1 border-2 border-ink/70 bg-paper px-3 text-base " +
            "placeholder:text-ink-faint focus:border-ink focus-visible:outline-offset-2 disabled:opacity-50"
          }
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={locked || !draft.trim()}
          className="sketch-sm grid size-11 shrink-0 place-items-center border-2 border-ink bg-ink text-paper disabled:opacity-40"
        >
          <PlusIcon className="size-6" />
          <span className="sr-only">{t("add")}</span>
        </button>
      </div>
      <p id={noticeId} aria-live="polite" className={cx("mt-2 min-h-5 text-sm", notice ? "text-ink" : "text-ink-faint")}>
        {notice ?? t("hint")}
      </p>

      {names.length === 0 ? (
        <p className="mt-3 text-ink-soft">{t("empty")}</p>
      ) : (
        <ul className="-mx-3 mt-1 flex max-h-48 flex-wrap content-start gap-x-2 gap-y-3 overflow-y-auto p-3 lg:max-h-88">
          {names.map((name, index) => (
            <li key={name} className="max-w-full">
              <RedPenCircle active={name === highlight} seed={name} className="max-w-full">
                <NameChip name={name} index={index} count={names.length}>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => removeName(name)}
                      className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-on-marker/10"
                    >
                      <CloseIcon className="size-4" />
                      <span className="sr-only">{t("remove", { name })}</span>
                    </button>
                  )}
                </NameChip>
              </RedPenCircle>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
