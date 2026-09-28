export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://whozzie.vercel.app";

export const SITE_NAME = "Whozzie";

/**
 * Every picker, in navigation order. A picker's id is its route segment and its
 * message namespace, so adding one means: a folder under features/, a route under
 * app/[locale]/, a namespace in messages/*.json, and an entry here.
 */
export const PICKER_IDS = ["wheel", "dice", "ladder"] as const;

export type PickerId = (typeof PICKER_IDS)[number];

export const pickerHref = (id: PickerId) => `/${id}` as const;
