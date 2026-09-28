"use client";

import { useLayoutEffect, useRef } from "react";
import { NameChip } from "@/components/picker/NameChip";
import { RedPenCircle } from "@/components/ui/RedPenCircle";
import type { DieValue } from "./faces";
import { placeTags } from "./tags";

export type NameTag = {
  name: string;
  /** Position in the names list, for the marker colour. */
  index: number;
  count: number;
  /** Where the die is, in fractions of the table from its top-left. */
  x: number;
  y: number;
  /** What it rolled; left off before anyone has. */
  value?: DieValue;
};

/**
 * Stickers over the table saying whose die is whose, and what it rolled, so a
 * die hidden behind another or a colour shared by two people still reads.
 * Decorative for screen readers: the standings say the same in words.
 */
export function NameTags({ tags, winner }: { tags: readonly NameTag[]; winner: string | null }) {
  const frameRef = useRef<HTMLDivElement>(null);

  // A tag's size depends on its text, so they're laid out after render but before paint.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const items = [...frame.children] as HTMLElement[];
    const size = { width: frame.clientWidth, height: frame.clientHeight };
    const spots = placeTags(
      tags.map((tag) => ({ x: tag.x * size.width, y: tag.y * size.height })),
      items.map((item) => ({ width: item.offsetWidth, height: item.offsetHeight })),
      size,
    );
    items.forEach((item, i) => {
      item.style.translate = `${spots[i].x}px ${spots[i].y}px`;
    });
  }, [tags]);

  return (
    <div ref={frameRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {tags.map((tag) => (
        <div key={tag.name} title={tag.name} className="pointer-events-auto absolute top-0 left-0">
          <RedPenCircle active={tag.name === winner} seed={tag.name}>
            <NameChip name={tag.name} index={tag.index} count={tag.count} size="sm" className="max-w-[8.5rem]">
              {tag.value && (
                <span className="shrink-0 border-l-[1.5px] border-on-marker/35 pl-1.5 font-hand text-lg leading-none font-bold">
                  {tag.value}
                </span>
              )}
            </NameChip>
          </RedPenCircle>
        </div>
      ))}
    </div>
  );
}
