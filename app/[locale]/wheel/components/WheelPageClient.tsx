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
      <div className="flex flex-col items-center">
        <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row gap-6">
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <PersonInput />
              <ItemList />
              <WheelControls />
            </div>

            <div className="flex-1 flex flex-col items-center">
              <Wheel />
              <ResultDisplay />
            </div>
          </div>
        </main>
      </div>
    </WheelProvider>
  );
}
