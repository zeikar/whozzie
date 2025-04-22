import { useRef, useEffect } from "react";
import { useRoulette } from "../context/RouletteContext";

export default function RouletteWheel() {
  const { people, rotationAngle, wheelRef, spinning } = useRoulette();
  const localWheelRef = useRef<HTMLDivElement>(null);

  // ref 연결
  useEffect(() => {
    if (localWheelRef.current && wheelRef) {
      wheelRef.current = localWheelRef.current;
    }
  }, [wheelRef]);

  // 몇 퍼센트씩 나눌지 계산
  const slicePercent = 100 / people.length;
  // conic-gradient용 문자열 생성
  const gradientSegments = people
    .map((_, i) => {
      const start = slicePercent * i;
      const end = slicePercent * (i + 1);
      const hue = (i * 360) / people.length;
      return `hsl(${hue}, 70%, 60%) ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      {/* 바깥 그림자 */}
      <div className="absolute inset-0 rounded-full shadow-lg"></div>

      {/* 룰렛 판 */}
      <div
        ref={localWheelRef}
        className="absolute w-full h-full rounded-full border-8 border-purple-600 overflow-hidden shadow-inner"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transition: spinning
            ? "transform 5s cubic-bezier(0.1,0.7,0.1,1)"
            : "none",
          background: `conic-gradient(${gradientSegments})`,
        }}
      >
        {/* 이름 라벨들 */}
        {people.map((person, i) => {
          // 각 조각의 중앙 각도
          const labelAngle = slicePercent * (i + 0.5) * 3.6; // 360도 기준으로 조정
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `
                  rotate(${labelAngle}deg)      /* 조각 중심으로 회전 */
                  translateY(-400%)             /* 바깥쪽으로 약간 이동 */
                `,
              }}
            >
              <span
                className="block text-white text-sm font-bold whitespace-nowrap"
                style={{
                  transform: `rotate(90deg)` /* 텍스트를 가독성 있게 회전 */,
                }}
              >
                {person}
              </span>
            </div>
          );
        })}

        {/* 가운데 원 */}
        <div
          className="absolute rounded-full bg-white dark:bg-gray-700 shadow-md border-4 border-purple-600"
          style={{
            width: "30%",
            height: "30%",
            top: "35%",
            left: "35%",
            zIndex: 5,
          }}
        />
      </div>

      {/* 포인터 */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        {/* 삼각형 포인터 (위에서 아래로) */}
        <div className="w-8 h-10 flex justify-center items-start">
          <div className="w-0 h-0 
            border-l-[12px] border-l-transparent 
            border-r-[12px] border-r-transparent 
            border-t-[24px] border-t-red-600
            filter drop-shadow-md">
          </div>
        </div>
      </div>
    </div>
  );
}
