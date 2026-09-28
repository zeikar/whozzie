"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { RedPenCircle } from "@/components/ui/RedPenCircle";
import { removeName } from "@/lib/names";

/**
 * A slip of paper that slides over the page with the verdict. Built on <dialog>
 * for focus trapping, Escape and the top layer; clicking the backdrop closes it.
 * A closed <dialog> is display:none, so CSS animations inside (the red-pen
 * circle) replay every time it opens.
 */
export function ResultDialog({
  open,
  onClose,
  heading,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  heading: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const t = useTranslations("result");
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={headingId}
      // Read the verdict with the dialog's name; focus lands on Close, not on it.
      aria-describedby={bodyId}
      onClose={(event) => {
        // The close event is queued; when the next result reopens the dialog at
        // once (reduced motion, no 3D), the old one lands after the reopen.
        if (event.currentTarget.open) return;
        // Focus goes back to whatever opened the dialog, unless that's gone
        // (e.g. the name was removed and took the ladder with it).
        if (document.activeElement === document.body) {
          document.querySelector<HTMLElement>("[data-names-input]")?.focus();
        }
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={
        "m-auto w-[min(30rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink backdrop:bg-ink/35 " +
        // Slides in on open but closes at once, so the slip never shows a new round's
        // contents (or none) while fading out.
        "open:transition-[opacity,translate,rotate] open:duration-250 open:ease-out " +
        "starting:open:translate-y-3 starting:open:-rotate-1 starting:open:opacity-0 " +
        "open:backdrop:transition-opacity open:backdrop:duration-250 starting:open:backdrop:opacity-0 " +
        "motion-reduce:transition-none motion-reduce:backdrop:transition-none"
      }
    >
      <div className="sketch relative border-2 border-ink bg-card px-6 pt-6 pb-5 sm:px-8">
        <button
          type="button"
          onClick={onClose}
          className="sketch-sm absolute top-3 right-3 grid size-10 place-items-center text-ink-soft hover:text-ink"
        >
          <CloseIcon className="size-6" />
          <span className="sr-only">{t("close")}</span>
        </button>
        <h2 id={headingId} className="pr-10 font-hand text-2xl font-bold text-ink-soft">
          {heading}
        </h2>
        <div id={bodyId}>{children}</div>
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </dialog>
  );
}

/** The picked name, written large and circled in red pen. */
export function Verdict({ name }: { name: string }) {
  return (
    <p className="py-8 text-center font-hand text-[clamp(2.75rem,10vw,4.5rem)] leading-none font-bold break-words">
      <RedPenCircle active seed={name} className="max-w-full px-1">
        {name}
      </RedPenCircle>
    </p>
  );
}

/**
 * The result dialog's buttons: go again, and take the picked name off the list
 * (NamesCard then offers to undo that). Pass `remove={null}` when there's no
 * single pick, e.g. a list of everyone's results.
 */
export function VerdictActions({
  again,
  onAgain,
  remove,
  onRemoved,
}: {
  again: string;
  onAgain: () => void;
  remove: string | null;
  /** Called after the name is removed; usually closes the dialog. */
  onRemoved: () => void;
}) {
  const t = useTranslations("result");
  return (
    <>
      <Button variant="primary" onClick={onAgain} className="flex-1">
        {again}
      </Button>
      {remove !== null && (
        <Button
          onClick={() => {
            removeName(remove);
            onRemoved();
          }}
          className="flex-1"
        >
          {t("removeName", { name: remove })}
        </Button>
      )}
    </>
  );
}
