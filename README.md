# Whozzie

Who's it gonna be? Write the names down once, then decide with a spinning wheel, 3D dice, or a ladder game (사다리타기).
Live at [whozzie.vercel.app](https://whozzie.vercel.app), in English and Korean.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 (Korean at /ko)
npm test           # unit tests (Vitest)
npm run typecheck  # route types + TypeScript 7
npm run lint
npm run build
```

TypeScript is installed side by side: `tsc` is TypeScript 7 (`@typescript/native`), while `typescript` is the TS 6 API
package that typescript-eslint and `next build` still need. ESLint stays on 9 until `eslint-config-next`'s plugins
support 10.

## How it's put together

```
app/[locale]/          routes; each page is a thin shell around a feature component
features/<picker>/     one folder per picker: components, pure logic, tests
components/picker/     what every picker shares: PickerLayout, NamesCard, NameChip, ResultDialog + Verdict
components/ui/         Button, SegmentedControl, RedPenCircle
components/site/       header, nav, language + theme switches, footer
lib/                   names store, crypto randomness, marker colors, hand-drawn path helpers, metadata
messages/{en,ko}.json  copy; one namespace per picker
```

- **One names list.** `lib/names.ts` keeps the list in `localStorage`, shared by every picker and synced across tabs.
- **Fair picks.** `lib/random.ts` draws from `crypto.getRandomValues` with rejection sampling. Pickers decide the result
  first and animate toward it (the wheel), or read it from physics seeded by crypto randomness (the dice); the ladder
  seats players in a shuffled order so every result is equally likely.
- **A person's color follows them.** `lib/markers.ts` maps a name's position to one of eight marker colors, used for
  their chip, wheel slice, die and ladder line.

## Design

The light theme is the back page of a school notebook (graph paper, ballpoint ink, highlighters, a red margin rule);
the dark theme is a classroom chalkboard. Tokens live in `app/globals.css`. Red is reserved for the verdict: the red-pen
circle drawn around whoever gets picked.

## Adding a picker

1. Add its id to `PICKER_IDS` in `lib/site.ts` (nav, home page and sitemap pick it up) and a doodle to
   `PICKER_DOODLES` in `components/icons.tsx`.
2. Add a namespace with `name`, `summary`, `meta`, `heading`, `lede` to both `messages/en.json` and `messages/ko.json`.
3. Build it in `features/<id>/` on top of `PickerLayout`, `NamesCard` and `ResultDialog`, with its logic in plain
   modules and tests beside them.
4. Add `app/[locale]/<id>/page.tsx`, copying `app/[locale]/wheel/page.tsx`.
