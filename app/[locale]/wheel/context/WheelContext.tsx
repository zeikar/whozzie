"use client";

import { createContext, useState, useContext, ReactNode, useRef } from "react";

interface WheelContextType {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (index: number) => void;
  spinning: boolean;
  resultIndex: number | null;
  rotationAngle: number;
  resetWheel: () => void;
  spinWheel: () => void;
  closeResult: () => void;
  removeSelectedItem: () => void;
  wheelRef: React.RefObject<HTMLDivElement | null>;
  showResult: boolean;
}

const WheelContext = createContext<WheelContextType | undefined>(undefined);

export function WheelProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addItem = (item: string) => {
    if (item.trim() && !items.includes(item.trim())) {
      setItems([...items, item.trim()]);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const resetWheel = () => {
    setItems([]);
    setResultIndex(null);
    setRotationAngle(0);
    setShowResult(false);
    if (wheelRef.current) {
      wheelRef.current.style.transform = "rotate(0deg)";
    }
  };

  const closeResult = () => {
    setShowResult(false);
  };

  const removeSelectedItem = () => {
    if (resultIndex !== null) {
      removeItem(resultIndex);
      setResultIndex(null);
      setShowResult(false);
    }
  };

  const spinWheel = () => {
    if (items.length < 1 || spinning) return;

    setSpinning(true);
    setResultIndex(null);
    setShowResult(false);

    // Generate a random number of full rotations (5-10) plus a random angle
    const totalRotations = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const spinAngle = totalRotations * 360 + randomAngle;

    // Set the new rotation angle
    const newRotationAngle = rotationAngle + spinAngle;
    setRotationAngle(newRotationAngle);

    // Calculate which item is selected based on the final angle
    const degreePerItem = 360 / items.length;

    // 룰렛이 시계방향으로 회전하므로, 최종 각도의 반대 방향으로 인덱스 계산
    // 시작 위치(0도)가 맨 위의 포인터 위치임을 감안
    const finalAngleNormalized = newRotationAngle % 360;
    const selectedIndex =
      Math.floor(finalAngleNormalized / degreePerItem) % items.length;

    // 룰렛 회전 방향과 일치하도록 인덱스 조정
    const adjustedIndex = items.length - 1 - selectedIndex;

    // Apply the rotation
    if (wheelRef.current) {
      wheelRef.current.style.transition =
        "transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)";
      wheelRef.current.style.transform = `rotate(${newRotationAngle}deg)`;
    }

    // Show result after animation completes
    setTimeout(() => {
      setResultIndex(adjustedIndex);
      setSpinning(false);
      setShowResult(true);
    }, 5000);
  };

  return (
    <WheelContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        spinning,
        resultIndex,
        rotationAngle,
        resetWheel,
        spinWheel,
        closeResult,
        removeSelectedItem,
        wheelRef,
        showResult,
      }}
    >
      {children}
    </WheelContext.Provider>
  );
}

export function useWheel() {
  const context = useContext(WheelContext);
  if (context === undefined) {
    throw new Error("useWheel must be used within a WheelProvider");
  }
  return context;
}
