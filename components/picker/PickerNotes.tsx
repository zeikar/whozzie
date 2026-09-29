import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PICKER_IDS, pickerHref, type PickerId } from "@/lib/site";

const STEPS = ["step1", "step2", "step3"] as const;

// The copy links another picker by its id: <wheel>Spin the wheel</wheel>.
const pickerLinks = Object.fromEntries(
  PICKER_IDS.map((id) => [
    id,
    (chunks: ReactNode) => (
      <Link href={pickerHref(id)} className="text-ink underline underline-offset-4">
        {chunks}
      </Link>
    ),
  ]),
);

// A step below the tool's own card titles, so the notes sit under the tool.
const heading = "font-hand text-2xl font-bold";
// Rules span the column; only the lines of text are kept short.
const rule = "border-t-2 border-dashed border-ink/15";

/**
 * A few notes under a picker, from its `about` messages: how to use it, why
 * it's fair, what it's good for. A server component, so the copy is part of
 * the page's HTML (for readers and search engines) and not the picker's code.
 */
export async function PickerNotes({ picker }: { picker: PickerId }) {
  const t = await getTranslations(`${picker}.about`);
  return (
    // Mirrors PickerLayout's columns: how-to under the names card, the rest under the stage.
    <div
      className={`mt-16 grid grid-cols-[minmax(0,1fr)] text-ink-soft ${rule} lg:grid-cols-[minmax(19rem,23rem)_minmax(0,1fr)] lg:gap-x-14`}
    >
      <section className="py-6 lg:row-span-2">
        <h2 className={heading}>{t("how.title")}</h2>
        <ol className="mt-2 max-w-prose list-decimal space-y-2 pl-5 marker:text-ink-faint">
          {STEPS.map((step) => (
            <li key={step}>{t(`how.${step}`)}</li>
          ))}
        </ol>
      </section>
      <section className={`${rule} py-6 lg:col-start-2 lg:border-t-0`}>
        <h2 className={heading}>{t("fair.title")}</h2>
        <p className="mt-2 max-w-prose">{t("fair.body")}</p>
      </section>
      <section className={`${rule} py-6 lg:col-start-2`}>
        <h2 className={heading}>{t("uses.title")}</h2>
        <p className="mt-2 max-w-prose">{t.rich("uses.body", pickerLinks)}</p>
      </section>
    </div>
  );
}
