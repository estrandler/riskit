"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GameResult {
  winner: "challenger" | "challengee";
  challengerResponse: number;
  challengeeResponse: number;
  completedAt: string;
}

interface OddsDocument {
  code: string;
  description: string;
  challenger: {
    name: string;
    response?: number;
  };
  challengee?: {
    name?: string;
    response?: number;
  };
  max?: number;
  gameResult?: GameResult;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [completedOdds, setCompletedOdds] = useState<OddsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedOdds();
  }, []);

  const fetchCompletedOdds = async () => {
    try {
      const response = await fetch("/api/odds/completed");
      if (response.ok) {
        const data = await response.json();
        setCompletedOdds(data);
      } else {
        setError("Failed to load completed odds");
      }
    } catch {
      setError("Failed to load completed odds");
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (odds: OddsDocument, isChallenger: boolean) => {
    if (!odds.gameResult) return "";

    const userWon =
      (isChallenger && odds.gameResult.winner === "challenger") ||
      (!isChallenger && odds.gameResult.winner === "challengee");

    return userWon
      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20">
        <div className="text-foreground text-sm">Laddar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-20">
        <div className="text-red-500 text-sm text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-8 gap-4 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Tidigare odds
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-foreground/60 hover:text-foreground underline"
        >
          Tillbaka till startsidan
        </button>
      </div>

      {completedOdds.length === 0 ? (
        <div className="text-center text-foreground/60 text-sm">
          Inga avslutade odds hittades
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-foreground">
                  Odds
                </th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-foreground">
                  Utmanare
                </th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-foreground">
                  Utmanad
                </th>
              </tr>
            </thead>
            <tbody>
              {completedOdds.map((odds) => (
                <tr
                  key={odds.code}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-foreground">
                    {odds.description}
                  </td>
                  <td
                    className={`border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium ${getCellColor(
                      odds,
                      true
                    )}`}
                  >
                    {odds.challenger.name}
                    {odds.gameResult && (
                      <div className="text-xs mt-1">
                        Svar: {odds.gameResult.challengerResponse}
                      </div>
                    )}
                  </td>
                  <td
                    className={`border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium ${getCellColor(
                      odds,
                      false
                    )}`}
                  >
                    {odds.challengee?.name || "N/A"}
                    {odds.gameResult && (
                      <div className="text-xs mt-1">
                        Svar: {odds.gameResult.challengeeResponse}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
