"use client";

import ItemList from "./ItemList";
import PersonInput from "./ItemInput";
import ResultDisplay from "./ResultDisplay";
import Wheel from "./Wheel";
import WheelControls from "./WheelControls";
import { WheelProvider } from "../context/WheelContext";

export default function WheelPageClient() {
  return (
    <WheelProvider>
      <div className="flex flex-col items-center py-8">
        <main className="w-full max-w-7xl mx-auto flex flex-col items-center px-4">
          <div className="w-full flex flex-col lg:flex-row gap-8">
            {/* Controls Panel */}
            <div className="lg:flex-1 w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900">
              <PersonInput />
              <ItemList />
              <WheelControls />
            </div>
            {/* Wheel Display */}{" "}
            <div className="lg:flex-1 w-full flex flex-col items-center justify-center py-8 px-4">
              <Wheel />
              <ResultDisplay />
            </div>
          </div>
        </main>
      </div>
    </WheelProvider>
  );
}
