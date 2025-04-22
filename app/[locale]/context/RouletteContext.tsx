'use client';

import { createContext, useState, useContext, ReactNode, useRef } from 'react';

interface RouletteContextType {
  people: string[];
  addPerson: (person: string) => void;
  removePerson: (index: number) => void;
  spinning: boolean;
  result: string | null;
  rotationAngle: number;
  resetRoulette: () => void;
  spinWheel: () => void;
  wheelRef: React.RefObject<HTMLDivElement | null>;
}

const RouletteContext = createContext<RouletteContextType | undefined>(undefined);

export function RouletteProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addPerson = (person: string) => {
    if (person.trim() && !people.includes(person.trim())) {
      setPeople([...people, person.trim()]);
    }
  };

  const removePerson = (index: number) => {
    const newPeople = [...people];
    newPeople.splice(index, 1);
    setPeople(newPeople);
  };

  const resetRoulette = () => {
    setPeople([]);
    setResult(null);
    setRotationAngle(0);
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };

  const spinWheel = () => {
    if (people.length < 2 || spinning) return;
    
    setSpinning(true);
    setResult(null);
    
    // Generate a random number of full rotations (5-10) plus a random angle
    const totalRotations = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const spinAngle = totalRotations * 360 + randomAngle;
    
    // Calculate which person is selected based on the final angle
    const degreePerPerson = 360 / people.length;
    const normalizedAngle = randomAngle % 360;
    const selectedIndex = Math.floor(normalizedAngle / degreePerPerson);
    const selectedPerson = people[people.length - 1 - selectedIndex];
    
    // Set the new rotation angle
    const newRotationAngle = rotationAngle + spinAngle;
    setRotationAngle(newRotationAngle);
    
    // Apply the rotation
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)';
      wheelRef.current.style.transform = `rotate(${newRotationAngle}deg)`;
    }
    
    // Show result after animation completes
    setTimeout(() => {
      setResult(selectedPerson);
      setSpinning(false);
    }, 5000);
  };

  return (
    <RouletteContext.Provider
      value={{
        people,
        addPerson,
        removePerson,
        spinning,
        result,
        rotationAngle,
        resetRoulette,
        spinWheel,
        wheelRef
      }}
    >
      {children}
    </RouletteContext.Provider>
  );
}

export function useRoulette() {
  const context = useContext(RouletteContext);
  if (context === undefined) {
    throw new Error('useRoulette must be used within a RouletteProvider');
  }
  return context;
}
