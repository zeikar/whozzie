export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://whozzie.vercel.app";

export const SITE_NAME = "Whozzie";

/**
 * Every picker, in navigation order. A picker's id is its route segment and its
 * message namespace; README.md's "Adding a picker" lists everything a new one needs.
 */
export const PICKER_IDS = ["wheel", "dice", "ladder"] as const;

export type PickerId = (typeof PICKER_IDS)[number];

export const pickerHref = (id: PickerId) => `/${id}` as const;
