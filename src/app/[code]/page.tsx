"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import MotivationalMessage from "@/components/MotivationalMessage";
import WinCelebration from "@/components/WinCelebration";

interface Challenger {
  name: string;
  response?: number;
}

interface Challengee {
  name?: string;
  response?: number;
}

interface GameResult {
  winner: "challenger" | "challengee";
  challengerResponse: number;
  challengeeResponse: number;
  completedAt: string;
}

interface OddsDocument {
  code: string;
  description: string;
  challenger: Challenger;
  challengee?: Challengee;
  max?: number;
  gameResult?: GameResult;
  createdAt: string;
}

export default function OddsView() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [odds, setOdds] = useState<OddsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [inputName, setInputName] = useState("");
  const [isChallenger, setIsChallenger] = useState(false);
  const [maxValue, setMaxValue] = useState("");
  const [isSubmittingMax, setIsSubmittingMax] = useState(false);
  const [gameResponse, setGameResponse] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch odds data
  const fetchOdds = useCallback(async () => {
    try {
      const response = await fetch(`/api/odds/${code}`);
      if (response.ok) {
        const data = await response.json();
        setOdds(data);
      } else if (response.status === 404) {
        // Redirect to start page if odds not found
        router.push("/");
        return;
      } else {
        setError("Failed to load odds");
      }
    } catch {
      setError("Failed to load odds");
    } finally {
      setLoading(false);
    }
  }, [code, router]);

  // Check user identity and set up polling if challenger
  useEffect(() => {
    const savedName = localStorage.getItem("riskit-username");
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  useEffect(() => {
    if (code) {
      fetchOdds();
    }
  }, [code, fetchOdds]);

  useEffect(() => {
    if (odds && userName) {
      const isUserChallenger = odds.challenger.name === userName;
      setIsChallenger(isUserChallenger);

      // Determine if we should poll
      let shouldPoll = false;

      if (!odds.gameResult) {
        if (isUserChallenger) {
          // Challenger should poll when waiting for max value OR waiting for challengee response
          shouldPoll =
            odds.max === undefined ||
            (odds.challenger.response !== undefined &&
              odds.challengee?.response === undefined);
        } else {
          // Challengee should poll when waiting for challenger response
          shouldPoll =
            odds.challengee?.response !== undefined &&
            odds.challenger.response === undefined;
        }
      }

      if (shouldPoll) {
        const interval = setInterval(fetchOdds, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
      }
    }
  }, [odds, userName, fetchOdds]);

  const handleGameResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameResponse.trim() || isNaN(Number(gameResponse))) return;

    const responseValue = Number(gameResponse);
    if (responseValue < 0 || responseValue > (odds?.max || 0) + 1) return;

    setIsSubmittingResponse(true);
    try {
      const response = await fetch(`/api/odds/${code}/response`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: responseValue,
          playerName: userName,
          isChallenger,
        }),
      });

      if (response.ok) {
        await response.json();

        fetchOdds(); // Refresh data
        setGameResponse("");
      } else {
        setError("Failed to submit response");
      }
    } catch {
      setError("Failed to submit response");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const copyUrlToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      const trimmedName = inputName.trim();
      localStorage.setItem("riskit-username", trimmedName);
      setUserName(trimmedName);
      setShowNameInput(false);
    }
  };

  const handleMaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maxValue.trim() || isNaN(Number(maxValue))) return;

    setIsSubmittingMax(true);
    try {
      const response = await fetch(`/api/odds/${code}/max`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max: Number(maxValue),
          challengeeName: userName,
        }),
      });

      if (response.ok) {
        fetchOdds(); // Refresh data
        setMaxValue("");
      } else {
        setError("Failed to submit max value");
      }
    } catch {
      setError("Failed to submit max value");
    } finally {
      setIsSubmittingMax(false);
    }
  };

  // Name input view
  if (showNameInput) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20 gap-6">
        <h1 className="text-lg font-medium text-white">Ange ditt namn</h1>
        <form
          onSubmit={handleNameSubmit}
          className="flex flex-col gap-3 items-center w-full max-w-xs"
        >
          <input
            type="text"
            placeholder="Ditt namn"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white text-center w-full text-sm placeholder-gray-400"
            required
            autoFocus
          />
          <button
            type="submit"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-5 w-full"
          >
            Fortsätt
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20">
        <div className="text-white text-sm">Laddar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20">
        <div className="text-red-400 text-sm text-center">{error}</div>
      </div>
    );
  }

  if (!odds) {
    // Automatically redirect to start page if odds not found
    router.push("/");
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20">
        <div className="text-white text-sm">
          Kod hittades inte, omdirigerar...
        </div>
      </div>
    );
  }

  // Show game result if completed
  if (odds.gameResult) {
    const userWon =
      (isChallenger && odds.gameResult.winner === "challenger") ||
      (!isChallenger && odds.gameResult.winner === "challengee");

    return (
      <>
        <WinCelebration isActive={true} isWin={userWon} />
        <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-8 gap-4 max-w-sm mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-2">Resultat!</h1>
          </div>

          <div className="bg-gray-900 rounded p-2 w-full">
            <p className="text-gray-200 font-medium text-md text-center">
              {odds.description}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded p-2 w-full">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">
                  {odds.challenger.name}
                </p>
                <p className="text-base font-bold text-white">
                  {odds.gameResult.challengerResponse}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">
                  {odds.challengee?.name}
                </p>
                <p className="text-base font-bold text-white">
                  {odds.gameResult.challengeeResponse}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div
                className={`text-sm font-bold mb-1 ${
                  odds.gameResult.winner === "challenger"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {(() => {
                  if (isChallenger) {
                    return userWon
                      ? "Dags att se till att sopan gör det!"
                      : "Bättre lycka nästa gång!";
                  } else {
                    return userWon
                      ? "Du kan slappna av!"
                      : "Hoppas du är törstig!";
                  }
                })()}
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-500 text-white hover:bg-gray-600 font-medium text-sm h-10 px-5 w-full"
          >
            Tillbaka till startsidan
          </button>
        </div>
      </>
    );
  }

  // Challenger view
  if (isChallenger) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-8 gap-4 max-w-sm mx-auto">
        <div className="text-center">
          <h1 className="text-lg font-medium text-white mb-2">Din utmaning</h1>

          <MotivationalMessage className="mb-4" />
          <p className="text-xs text-gray-400 mb-2">Kod: {odds.code}</p>
          <button
            onClick={copyUrlToClipboard}
            className="inline-flex items-center gap-1 text-xs bg-blue-900/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/30 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copySuccess ? "Kopierad!" : "Kopiera länk"}
          </button>
        </div>

        <div className="bg-gray-900 rounded p-3 w-full">
          <p className="text-gray-200 font-medium text-md text-center">
            {odds.description}
          </p>
        </div>

        {odds.max === undefined ? (
          <div className="text-center">
            <div className="animate-pulse">
              <div className="text-center">
                <div className="text-gray-400 text-sm">Oddsifierar...</div>
              </div>
            </div>
          </div>
        ) : odds.challenger.response === undefined ? (
          <div className="w-full max-w-xs">
            <div className="text-center mb-3">
              <h3 className="font-medium mb-1 text-sm text-white">
                Nu gäller det att gissa rätt
              </h3>
            </div>
            {odds.challengee?.response !== undefined &&
              ["räkan", "ogge", "ersken1337"].includes(
                userName.toLowerCase()
              ) && (
                <div className="mt-2 text-center">
                  <div
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      color: "rgba(156, 163, 175, 0.7)", // Very subtle gray, almost invisible
                      backgroundColor: "rgba(156, 163, 175, 0.1)",
                    }}
                  >
                    Motståndare: {odds.challengee?.response}
                  </div>
                </div>
              )}
            <form
              onSubmit={handleGameResponseSubmit}
              className="flex flex-col gap-3 items-center"
            >
              <input
                type="number"
                placeholder={`1 - ${odds.max}`}
                value={gameResponse}
                onChange={(e) => setGameResponse(e.target.value)}
                className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white text-center w-full text-sm placeholder-gray-400"
                required
                min="1"
                max={odds.max}
              />

              <button
                type="submit"
                disabled={isSubmittingResponse || !gameResponse.trim()}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-5 w-full"
              >
                {isSubmittingResponse ? "Skickar..." : "Skicka svar"}
              </button>
            </form>
          </div>
        ) : odds.challengee?.response === undefined ? (
          <div className="text-center">
            <div className="text-green-400 font-medium mb-1 text-sm">
              Ditt svar: {odds.challenger.response}
            </div>
            <div className="animate-pulse">
              <div className="text-gray-400 text-sm">
                Väntar på mottagarens svar...
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-400 font-medium text-sm">
              Båda har svarat! Beräknar resultat...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Challengee view
  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-8 gap-4 max-w-sm mx-auto">
      <div className="bg-gray-900 rounded p-3 w-full">
        <p className="text-gray-200 font-medium text-md text-center">
          {odds.challenger.name} utmanar dig &quot;{odds.description}&quot;
        </p>
      </div>

      <MotivationalMessage className="mb-4" />

      {odds.max === undefined ? (
        <form
          onSubmit={handleMaxSubmit}
          className="flex flex-col gap-3 items-center w-full max-w-xs"
        >
          <div className="text-center">
            <h3 className="font-medium mb-1 text-sm text-white">
              Vad ger du för odds?
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2 w-full mb-2">
            {[2, 5, 10, 20, 50, 100, 1000, 10000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMaxValue(value.toString())}
                className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center hover:bg-gray-700 hover:border-transparent font-medium text-sm h-12 px-2 bg-gray-800 text-white"
              >
                {value}
              </button>
            ))}
          </div>

          <div className="flex">
            <input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white text-center w-1/2 text-sm mr-2 placeholder-gray-400"
              required
              min="1"
            />

            <button
              type="submit"
              disabled={isSubmittingMax || !maxValue.trim()}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-5 w-1/2 disabled:opacity-50"
            >
              {isSubmittingMax ? "Skickar..." : "Skicka"}
            </button>
          </div>
        </form>
      ) : odds.challengee?.response === undefined ? (
        <div className="w-full max-w-xs">
          <div className="text-center mb-3">
            <h3 className="font-medium mb-1 text-sm text-white">
              Nu gäller det att gissa rätt
            </h3>
          </div>

          <form
            onSubmit={handleGameResponseSubmit}
            className="flex flex-col gap-3 items-center"
          >
            <input
              type="number"
              placeholder={`1 - ${odds.max}`}
              value={gameResponse}
              onChange={(e) => setGameResponse(e.target.value)}
              className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white text-center w-full text-sm placeholder-gray-400"
              required
              min="1"
              max={odds.max}
            />

            <button
              type="submit"
              disabled={isSubmittingResponse || !gameResponse.trim()}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-5 w-full disabled:opacity-50"
            >
              {isSubmittingResponse ? "Skickar..." : "Skicka svar"}
            </button>
          </form>
        </div>
      ) : odds.challenger.response === undefined ? (
        <div className="text-center">
          <div className="text-green-400 font-medium mb-1 text-sm">
            Ditt svar: {odds.challengee.response}
          </div>
          <div className="animate-pulse">
            <div className="text-gray-400 text-sm">
              Väntar på utmanarens svar...
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-green-400 font-medium text-sm">
            Båda har svarat! Beräknar resultat...
          </div>
        </div>
      )}
    </div>
  );
}
