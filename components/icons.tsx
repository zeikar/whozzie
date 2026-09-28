import type { ComponentProps } from "react";
import type { PickerId } from "@/lib/site";

type IconProps = ComponentProps<"svg">;

/** Stroke icons in the pen's color; decorative unless given a title by the caller. */
function Icon({ children, viewBox = "0 0 24 24", ...props }: IconProps) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12.2 5.2c-.3 4.6-.1 9.2.1 13.6M5.3 12.3c4.5-.3 9-.2 13.4.1" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.4 6.2c3.9 3.6 7.6 7.6 11.2 11.6M17.7 6.1C13.8 9.9 10 13.8 6.2 17.9" />
  </Icon>
);

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 7.6c2.5-.1 4.5 2 4.4 4.5-.1 2.4-2.1 4.3-4.5 4.3-2.5 0-4.4-2-4.3-4.5.1-2.3 2-4.2 4.4-4.3Z" />
    <path d="M12 2.8v1.9M12 19.4v1.8M2.9 12h1.8M19.3 12.1h1.8M5.5 5.6l1.3 1.3M17.2 17.2l1.3 1.3M5.6 18.5l1.3-1.3M17.2 6.8l1.3-1.3" />
  </Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19.6 14.6A7.9 7.9 0 0 1 9.3 4.3a8.2 8.2 0 1 0 10.3 10.3Z" />
  </Icon>
);

// ---------------------------------------------------------------------------
// Picker doodles: what a kid would draw in the margin to mean each game.

const WheelDoodle = (props: IconProps) => (
  <Icon viewBox="0 0 64 64" strokeWidth={2.4} {...props}>
    <path d="M32 32 32.2 9.5A22.6 22.6 0 0 1 54.4 31.6Z" fill="var(--marker-0)" />
    <path d="M32 32 54.4 31.6A22.4 22.4 0 0 1 32.3 54.6Z" fill="var(--marker-1)" />
    <path d="M32 32 32.3 54.6A22.7 22.7 0 0 1 9.4 32.3Z" fill="var(--marker-2)" />
    <path d="M32 32 9.4 32.3A22.5 22.5 0 0 1 32.2 9.5Z" fill="var(--marker-3)" />
    <path d="M32.4 8.9c12.8-.3 22.9 10.3 22.6 23.3-.3 12.4-10.5 22.5-23.1 22.4C19.2 54.4 9 44.1 9.1 31.5 9.3 19.1 19.6 9.3 32.4 8.9Z" />
    <path d="M28.2 3.6 32.3 11l3.9-7.3c-2.7-.4-5.4-.4-8 0Z" fill="currentColor" />
    <circle cx="32" cy="32" r="2.6" fill="currentColor" />
  </Icon>
);

const DiceDoodle = (props: IconProps) => (
  <Icon viewBox="0 0 64 64" strokeWidth={2.4} {...props}>
    <path d="M10.6 23.2 23 12.4l30.1.3-11.9 10.8Z" fill="var(--marker-1)" />
    <path d="M41.2 23.5 53.1 12.7l.2 29.4-11.6 11.3Z" fill="var(--marker-3)" />
    <path d="M10.6 23.2c10.2.1 20.4.2 30.6.3.2 10 .3 20 .5 29.9-10.3.1-20.6 0-30.9-.2-.1-10-.1-20-.2-30Z" fill="var(--card)" />
    <path d="M10.6 23.2 23 12.4l30.1.3-11.9 10.8M53.1 12.7l.2 29.4-11.6 11.3" />
    <g fill="currentColor" stroke="none">
      <circle cx="18.4" cy="31" r="2.6" />
      <circle cx="26.1" cy="38.4" r="2.6" />
      <circle cx="33.7" cy="45.8" r="2.6" />
      <ellipse cx="32" cy="18" rx="3.4" ry="1.7" />
    </g>
  </Icon>
);

const LadderDoodle = (props: IconProps) => (
  <Icon viewBox="0 0 64 64" strokeWidth={2.4} {...props}>
    <path
      d="M18 7v12.6h28.2v13.8H18.2v13.4H46V57"
      stroke="var(--marker-2)"
      strokeWidth={6.5}
      strokeLinejoin="round"
    />
    <path d="M18 7.2c.3 16.5.2 33.1.1 49.8M46.1 7c-.2 16.7 0 33.3.2 50" />
    <path d="M18.3 19.8c9.3-.5 18.6-.4 27.9-.2M18.1 33.3c9.4.3 18.7.2 28-.1M18.2 47c9.2-.3 18.6-.2 27.9.1" />
  </Icon>
);

export const PICKER_DOODLES: Record<PickerId, (props: IconProps) => React.ReactElement> = {
  wheel: WheelDoodle,
  dice: DiceDoodle,
  ladder: LadderDoodle,
};
