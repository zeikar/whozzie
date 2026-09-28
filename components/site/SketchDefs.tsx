/**
 * Shared SVG filters, referenced from CSS. `#chalk` breaks strokes up into grain
 * so drawings read as chalk on the dark theme (applied by the `.chalk` class).
 */
export function SketchDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="7" result="grain" />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.45"
          result="mask"
        />
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}
