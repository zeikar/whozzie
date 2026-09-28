"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/components/icons";
import { RedPenCircle } from "@/components/ui/RedPenCircle";

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
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={
        "m-auto w-[min(30rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink " +
        "opacity-0 translate-y-3 -rotate-1 transition-all transition-discrete duration-250 ease-out " +
        "open:opacity-100 open:translate-y-0 open:rotate-0 " +
        "starting:open:opacity-0 starting:open:translate-y-3 starting:open:-rotate-1 " +
        "backdrop:bg-ink/35 backdrop:transition-all backdrop:transition-discrete backdrop:duration-250 " +
        "backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 " +
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
        {children}
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
