import React from "react";
import { Cover } from "@/components/ui/cover";

export function CoverDemo() {
  return (
    <div>
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-blue-800 via-blue-600 to-blue-500 dark:from-blue-700 dark:via-blue-400 dark:to-blue-300">
        Empowering Your <br /> 
        <Cover>Health Management Journey</Cover> <br /> 
        With Innovative Solutions
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl max-w-5xl mx-auto text-center mt-4 text-neutral-700 dark:text-neutral-300">
        Addressing the unique challenges of independent living with modern technology and compassionate care.
      </p>
      
      {/* Credits Section */}
      <footer className="text-center p-4 mt-10">
        <div className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg">
        <p className="font-semibold">Expertly designed by <span className="text-blue-700 dark:text-blue-400">Team Luminaries</span></p>
        </div>
      </footer>
    </div>
  );
}
