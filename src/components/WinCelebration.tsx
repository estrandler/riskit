"use client";

import { useEffect, useState } from "react";

interface WinCelebrationProps {
  isActive: boolean;
  isWin?: boolean; // true for win, false for loss
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  emoji?: string; // For loss emojis
}

export default function WinCelebration({
  isActive,
  isWin = true,
}: WinCelebrationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Start background flashing
      setIsFlashing(true);

      // Create confetti particles
      const newConfetti: Confetti[] = [];

      if (isWin) {
        // Win confetti - colorful particles
        const colors = [
          "#FFD700",
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FECA57",
          "#FF9FF3",
          "#54A0FF",
          "#22C55E", // Bright green to match the flashing background
          "#10B981", // Another green shade for more green confetti
        ];

        for (let i = 0; i < 150; i++) {
          newConfetti.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 4000, // Random delay up to 4 seconds
          });
        }
      } else {
        // Loss emojis - poop and eggplant
        const emojis = ["💩", "🍆", "💩", "🍆", "💩"];

        for (let i = 0; i < 100; i++) {
          newConfetti.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            color: "transparent", // Not used for emojis
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            delay: Math.random() * 4000, // Random delay up to 4 seconds
          });
        }
      }

      setConfetti(newConfetti);

      // Stop background flashing after 8 seconds
      const flashTimer = setTimeout(() => {
        setIsFlashing(false);
      }, 8000);

      // Clear confetti after 12 seconds
      const confettiTimer = setTimeout(() => {
        setConfetti([]);
      }, 12000);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [isActive, isWin]);

  if (!isActive) return null;

  return (
    <>
      {/* Flashing background overlay */}
      {isFlashing && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            animation: isWin
              ? "flashColors 0.6s ease-in-out infinite alternate"
              : "flashLossColors 0.6s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* Confetti particles or loss emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              backgroundColor: particle.emoji ? "transparent" : particle.color,
              fontSize: particle.emoji ? "40px" : undefined,
              width: particle.emoji ? "auto" : "8px",
              height: particle.emoji ? "auto" : "8px",
              borderRadius: particle.emoji ? "0" : "50%",
              animation: `confettiFall 5s ease-in-out ${particle.delay}ms forwards`,
              transform: "translateY(-10px)",
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Victory/Defeat text */}
      <div className="fixed inset-0 pointer-events-none z-60 flex items-center justify-center">
        <div
          className={`
            text-6xl font-bold text-white drop-shadow-lg
            transform transition-all duration-500 ease-in-out
            ${isFlashing ? "scale-110 opacity-100" : "scale-100 opacity-90"}
            ${isWin ? "text-yellow-300" : "text-red-300"}
          `}
          style={{
            textShadow:
              "3px 3px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(0,0,0,0.5)",
            animation: isWin
              ? "bounce 1.5s ease-in-out infinite alternate"
              : "shake 0.8s ease-in-out infinite",
          }}
        >
          {isWin ? "Du är en vinnare!" : "Du är en förlorare!"}
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes flashColors {
          0% {
            background: rgba(34, 197, 94, 0.6);
            opacity: 0.2;
          }
          50% {
            background: rgba(34, 197, 94, 0.6);
            opacity: 0.7;
          }
          51% {
            background: rgba(255, 255, 0, 0.6);
            opacity: 0.7;
          }
          100% {
            background: rgba(255, 255, 0, 0.6);
            opacity: 0.2;
          }
        }

        @keyframes flashLossColors {
          0% {
            background: rgba(239, 68, 68, 0.6);
            opacity: 0.2;
          }
          50% {
            background: rgba(239, 68, 68, 0.6);
            opacity: 0.7;
          }
          51% {
            background: rgba(255, 165, 0, 0.6);
            opacity: 0.7;
          }
          100% {
            background: rgba(255, 165, 0, 0.6);
            opacity: 0.2;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
          75% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
