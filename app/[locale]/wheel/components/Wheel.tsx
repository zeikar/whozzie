import { useRef, useEffect } from "react";
import { useWheel } from "../context/WheelContext";

export default function Wheel() {
  const { items, rotationAngle, wheelRef, spinning } = useWheel();
  const localWheelRef = useRef<HTMLDivElement>(null);

  // Connect ref
  useEffect(() => {
    if (localWheelRef.current && wheelRef) {
      wheelRef.current = localWheelRef.current;
    }
  }, [wheelRef]);

  // Calculate percentage per slice
  const slicePercent = 100 / items.length;

  // Deep pastel color palette for the wheel
  const distinctColors = [
    "#FF9FB2", // Deep pastel pink
    "#FFD166", // Deep pastel yellow
    "#C8A2D4", // Deep lavender
    "#7D6B91", // Deep purple
    "#CD6BA3", // Deep lilac
    "#F7A9BC", // Deep pink
    "#FFBEA3", // Deep peach
    "#8FDAC1", // Deep mint
    "#9BB0DD", // Deep baby blue
    "#D6BED1", // Deep lilac
    "#A0CED9", // Deep cyan
    "#6CC3BC", // Deep aquamarine
    "#ADC178", // Deep lime
    "#C8C6AF", // Deep olive
    "#E1DAC8", // Deep ivory
    "#89C489", // Deep mint
    "#EEA5BD", // Deep rose
    "#A8CFE7", // Deep sky blue
    "#FAA0A0", // Deep apricot
    "#A78ECC", // Deep purple
  ];

  // Build conic-gradient string
  const gradientSegments = items
    .map((_, i) => {
      const start = slicePercent * i;
      const end = slicePercent * (i + 1);
      // Pick color from palette (cycling)
      const colorIndex = i % distinctColors.length;
      return `${distinctColors[colorIndex]} ${start}% ${end}%`;
    })
    .join(", ");
  return (
    <div className="relative w-[90vw] h-[90vw] max-w-[550px] max-h-[550px] overflow-hidden">
      {/* Top pointer (arrow) */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-r-[16px] sm:border-r-[20px] border-r-transparent border-t-[30px] sm:border-t-[40px] border-t-purple-700"></div>
      </div>

      {/* Outer shadow and highlight effect */}
      <div className="absolute inset-0 rounded-full shadow-xl bg-gradient-to-br from-purple-200 to-transparent opacity-50"></div>

      {/* Glare effect overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-20 pointer-events-none z-[1]"></div>

      {/* Wheel disc */}
      <div
        ref={localWheelRef}
        className="absolute w-full h-full rounded-full border-8 border-purple-700 overflow-hidden shadow-inner"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transition: spinning
            ? "transform 5s cubic-bezier(0.1,0.7,0.1,1)"
            : "none",
          background: `conic-gradient(${gradientSegments})`,
        }}
      >
        {/* Segment dividers - shown only when 2+ items */}
        {items.length > 1 &&
          items.map((_, i) => {
            // Calculate angle for each divider
            const angle = (360 / items.length) * i;
            return (
              <div
                key={`divider-group-${i}`}
                className="divider-group"
                style={{ position: "absolute", width: "100%", height: "100%" }}
              >
                {/* White divider line */}
                <div
                  className="absolute top-0 left-1/2 bg-white"
                  style={{
                    width: "3px",
                    height: "50%",
                    transformOrigin: "bottom center",
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    zIndex: 3,
                    opacity: 0.9,
                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.6)",
                  }}
                />
              </div>
            );
          })}
        {/* Item labels */}
        {items.map((item, i) => {
          // Center angle of each slice (adjusted to 360 degrees)
          const labelAngle = slicePercent * (i + 0.5) * 3.6;
          const textLength = item.length;

          // Dynamically adjust font size based on screen size and text length
          let fontSizeClass = "";

          // Smaller font for longer text
          if (textLength > 12) {
            fontSizeClass = "text-xs sm:text-sm md:text-lg"; // Long text
          } else if (textLength > 8) {
            fontSizeClass = "text-sm sm:text-base md:text-xl"; // Medium text
          } else {
            fontSizeClass = "text-base sm:text-xl md:text-2xl"; // Short text
          }

          // Max display length per screen size - shorter on smaller screens
          let mobileMaxLength = textLength > 12 ? 5 : textLength > 8 ? 7 : 10;
          let tabletMaxLength = textLength > 12 ? 8 : textLength > 8 ? 10 : 14;
          let desktopMaxLength = textLength > 12 ? 12 : textLength; // Up to 12 chars on desktop, full text if shorter

          // Prepare truncated text per breakpoint
          const displayTextMobile =
            textLength > mobileMaxLength
              ? `${item.substring(0, mobileMaxLength)}...`
              : item;
          const displayTextTablet =
            textLength > tabletMaxLength
              ? `${item.substring(0, tabletMaxLength)}...`
              : item;
          const displayTextDesktop =
            textLength > desktopMaxLength
              ? `${item.substring(0, desktopMaxLength)}...`
              : item;

          // Adjust label position by screen size
          const translateYValue = "clamp(-350%, -400%, -450%)";

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `
                  rotate(${labelAngle}deg)      /* Rotate to slice center */
                  translateY(${translateYValue}) /* Dynamically offset by screen size */
                `,
                width: "40%" /* Slightly smaller than the wheel radius */,
              }}
            >
              <div className="relative">
                <span
                  className={`block text-white font-bold px-1 py-0.5 sm:px-2 sm:py-1 ${fontSizeClass} text-center`}
                  style={{
                    transform: `rotate(90deg)` /* Rotate text for readability */,
                    textShadow:
                      "2px 2px 4px rgba(0,0,0,0.9)" /* Deeper shadow for better readability */,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    borderRadius: "4px" /* Slightly rounded corners */,
                  }}
                >
                  {/* Display different text per screen size */}
                  <span className="block md:hidden">{displayTextMobile}</span>
                  <span className="hidden sm:block md:hidden">
                    {displayTextTablet}
                  </span>
                  <span className="hidden md:block">{displayTextDesktop}</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* Center circle */}
        <div
          className="absolute rounded-full bg-purple-100 dark:bg-gray-700 shadow-md border-4 border-purple-600"
          style={{
            width: "10%",
            height: "10%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            zIndex: 5,
          }}
        />
      </div>
    </div>
  );
}
