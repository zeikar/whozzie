import { useRef, useEffect } from "react";
import { useWheel } from "../context/WheelContext";

export default function Wheel() {
  const { items, rotationAngle, wheelRef, spinning } = useWheel();
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
    <div className="relative w-[90vw] h-[90vw] max-w-[550px] max-h-[550px] overflow-hidden">
      {/* 하단 포인터 (화살표) */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-r-[16px] sm:border-r-[20px] border-r-transparent border-t-[30px] sm:border-t-[40px] border-t-purple-700"></div>
      </div>

      {/* 바깥 그림자와 강조효과 */}
      <div className="absolute inset-0 rounded-full shadow-xl bg-gradient-to-br from-purple-200 to-transparent opacity-50"></div>

      {/* Glare effect overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-20 pointer-events-none z-[1]"></div>

      {/* 룰렛 판 */}
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
        {/* 내부 경계선 - 각 영역 사이에 선 추가 (아이템이 2개 이상일 때만) */}
        {items.length > 1 &&
          items.map((_, i) => {
            // 각 분할선의 각도 계산
            const angle = (360 / items.length) * i;
            return (
              <div
                key={`divider-group-${i}`}
                className="divider-group"
                style={{ position: "absolute", width: "100%", height: "100%" }}
              >
                {/* 흰색 선 */}
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
        {/* 이름 라벨들 */}
        {items.map((item, i) => {
          // 각 조각의 중앙 각도
          const labelAngle = slicePercent * (i + 0.5) * 3.6; // 360도 기준으로 조정
          // 텍스트 길이에 따라 폰트 크기 조절
          const textLength = item.length;

          // 화면 크기와 텍스트 길이에 따라 동적으로 폰트 사이즈 조절
          let fontSizeClass = "";

          // 텍스트 길이에 따라 폰트 크기 조절 (더 길수록 작은 폰트)
          if (textLength > 12) {
            fontSizeClass = "text-xs sm:text-sm md:text-lg"; // 긴 텍스트
          } else if (textLength > 8) {
            fontSizeClass = "text-sm sm:text-base md:text-xl"; // 중간 길이 텍스트
          } else {
            fontSizeClass = "text-base sm:text-xl md:text-2xl"; // 짧은 텍스트
          }

          // 화면 크기별 최대 표시 길이 - 작은 화면일수록 짧게, 텍스트가 길수록 더 짧게 표시
          let mobileMaxLength = textLength > 12 ? 5 : textLength > 8 ? 7 : 10;
          let tabletMaxLength = textLength > 12 ? 8 : textLength > 8 ? 10 : 14;
          let desktopMaxLength = textLength > 12 ? 12 : textLength; // 데스크탑에서는 길면 12자까지, 아니면 전체

          // 반응형에 맞게 텍스트 준비 (특정 길이 초과시 말줄임표 처리)
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

          // 화면 크기에 따라 위치 조정 (모바일에서는 더 안쪽으로)
          const translateYValue = "clamp(-350%, -400%, -450%)";

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `
                  rotate(${labelAngle}deg)      /* 조각 중심으로 회전 */
                  translateY(${translateYValue}) /* 화면 크기에 따라 동적으로 위치 조정 */
                `,
                width: "40%" /* 원의 반지름보다 약간 작게 설정 */,
              }}
            >
              <div className="relative">
                <span
                  className={`block text-white font-bold px-1 py-0.5 sm:px-2 sm:py-1 ${fontSizeClass} text-center`}
                  style={{
                    transform: `rotate(90deg)` /* 텍스트를 가독성 있게 회전 */,
                    textShadow:
                      "2px 2px 4px rgba(0,0,0,0.9)" /* 더 진한 그림자로 가독성 향상 */,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    borderRadius: "4px" /* 배경에 약간의 둥근 모서리 적용 */,
                  }}
                >
                  {/* 화면 크기별로 다른 텍스트 표시 */}
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

        {/* 가운데 원 */}
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
