"use client";

import { useState, useEffect } from "react";

const motivationalMessages = [
  "Våga satsa - våga vinna! 🎯",
  "Lyckan gynnar de djärva! ⭐",
  "Ingen risk, ingen belöning! 💪",
  "Dags att testa din tur! 🍀",
  "Känner du dig lyckosam idag? 🎲",
  "Bara de som vågar kan vinna stort! 🏆",
  "Hitta sexiga singlar nara dig! 💃🍆",
  "Tiden är inne att ta risker! ⚡",
  "Förlorare hittar ursäkter, vinnare hittar vägar! 🚀",
  "Din nästa stora vinst väntar! 💎",
  "Spänning och adrenalinkick garanterad! 🔥",
  "Liten å knottrig ser ut som ett J 🌝",
  "Va inte bög, spela åt höger 🏌️",
  "Primetime på Pornhub 24/7 🍆",
  "På Marstrand är det Primetime hela dagen 🌞",
  "Var är min järn-nia? ⁉️",
  "Golfbil, nej tack 😡",
  "Är du klar med den där?!?!",
  "Om jag bor på fastlandet följer jag inte med! 🙂",
  "Städning? /stealth=on 🥷🥷🥷",
  "Jag har migrän/borrelia 👶😢",
];

const gradientColors = [
  "from-purple-600 to-pink-600",
  "from-blue-600 to-cyan-600",
  "from-green-600 to-emerald-600",
  "from-orange-600 to-red-600",
  "from-indigo-600 to-purple-600",
  "from-teal-600 to-blue-600",
  "from-rose-600 to-pink-600",
  "from-yellow-600 to-orange-600",
  "from-lime-600 to-green-600",
  "from-violet-600 to-fuchsia-600",
];

interface MotivationalMessageProps {
  className?: string;
}

export default function MotivationalMessage({
  className = "",
}: MotivationalMessageProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentGradient, setCurrentGradient] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set initial random message and gradient
    const getRandomMessage = () => {
      const randomIndex = Math.floor(
        Math.random() * motivationalMessages.length
      );
      return motivationalMessages[randomIndex];
    };

    const getRandomGradient = () => {
      const randomIndex = Math.floor(Math.random() * gradientColors.length);
      return gradientColors[randomIndex];
    };

    setCurrentMessage(getRandomMessage());
    setCurrentGradient(getRandomGradient());

    // Set up interval to change message every 5 seconds with fade animation
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentMessage(getRandomMessage());
        setCurrentGradient(getRandomGradient());
        setIsVisible(true);
      }, 300);
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`text-center ${className}`}>
      <div
        className={`
          inline-block px-4 py-2 rounded-full 
          bg-gradient-to-r ${currentGradient}
          transform transition-all duration-300 ease-in-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          shadow-lg hover:shadow-xl
        `}
      >
        <p className="text-sm font-semibold text-white drop-shadow-sm">
          {currentMessage}
        </p>
      </div>
    </div>
  );
}
