import { useRef, useEffect } from "react";
import { useRoulette } from "../context/RouletteContext";

export default function RouletteWheel() {
  const { items, rotationAngle, wheelRef, spinning } = useRoulette();
  const localWheelRef = useRef<HTMLDivElement>(null);

  // ref 연결
  useEffect(() => {
    if (localWheelRef.current && wheelRef) {
      wheelRef.current = localWheelRef.current;
    }
  }, [wheelRef]);

  // 몇 퍼센트씩 나눌지 계산
  const slicePercent = 100 / items.length;
  // 룰렛을 위한 진한 파스텔 톤 색상 팔레트 정의
  const distinctColors = [
    "#FF9FB2", // 진한 파스텔 핑크
    "#FFD166", // 진한 파스텔 옐로우
    "#C8A2D4", // 진한 라벤더
    "#7D6B91", // 진한 보라
    "#CD6BA3", // 진한 라일락
    "#F7A9BC", // 진한 분홍
    "#FFBEA3", // 진한 피치
    "#8FDAC1", // 진한 민트
    "#9BB0DD", // 진한 베이비 블루
    "#D6BED1", // 진한 라일락
    "#A0CED9", // 진한 시안
    "#6CC3BC", // 진한 아쿠아마린
    "#ADC178", // 진한 라임
    "#C8C6AF", // 진한 올리브
    "#E1DAC8", // 진한 아이보리
    "#89C489", // 진한 민트
    "#EEA5BD", // 진한 로즈
    "#A8CFE7", // 진한 하늘색
    "#FAA0A0", // 진한 살구색
    "#A78ECC", // 진한 퍼플
  ];

  // conic-gradient용 문자열 생성
  const gradientSegments = items
    .map((_, i) => {
      const start = slicePercent * i;
      const end = slicePercent * (i + 1);
      // 색상 팔레트에서 색상 선택 (순환)
      const colorIndex = i % distinctColors.length;
      return `${distinctColors[colorIndex]} ${start}% ${end}%`;
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
        {items.map((item, i) => {
          // 각 조각의 중앙 각도
          const labelAngle = slicePercent * (i + 0.5) * 3.6; // 360도 기준으로 조정
          // 텍스트 길이에 따라 폰트 크기 조절
          const textLength = item.length;
          let fontSize = "1.25rem"; // 기본 크기 (text-xl)
          let maxLength = 10; // 기본 최대 길이

          // 텍스트 길이에 따라 폰트 크기 조절
          if (textLength > 12) {
            fontSize = "0.875rem"; // 긴 텍스트는 작게 (text-sm)
            maxLength = 14;
          } else if (textLength > 8) {
            fontSize = "1rem"; // 중간 길이 텍스트 (text-base)
            maxLength = 12;
          }

          // 텍스트가 최대 길이를 초과하면 말줄임표 처리
          const displayText =
            item.length > maxLength
              ? `${item.substring(0, maxLength)}...`
              : item;

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `
                  rotate(${labelAngle}deg)      /* 조각 중심으로 회전 */
                  translateY(-300%)             /* 바깥쪽으로 약간 이동 */
                `,
              }}
            >
              <span
                className="block text-white font-bold whitespace-nowrap px-2 py-1"
                style={{
                  transform: `rotate(90deg)` /* 텍스트를 가독성 있게 회전 */,
                  fontSize: fontSize,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                }}
              >
                {displayText}
              </span>
            </div>
          );
        })}

        {/* 가운데 원 */}
        <div
          className="absolute rounded-full bg-white dark:bg-gray-700 shadow-md border-4 border-purple-600"
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

      {/* 포인터 */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        {/* 삼각형 포인터 (위에서 아래로) */}
        <div className="w-8 h-10 flex justify-center items-start">
          <div
            className="w-0 h-0 
            border-l-[12px] border-l-transparent 
            border-r-[12px] border-r-transparent 
            border-t-[24px] border-t-red-600
            filter drop-shadow-md"
          ></div>
        </div>
      </div>
    </div>
  );
}
