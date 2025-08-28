"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [inputName, setInputName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [description, setDescription] = useState("");

  // Check for existing name in localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem("riskit-username");
    if (savedName) {
      setUserName(savedName);
      setShowNameInput(false);
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      const trimmedName = inputName.trim();
      localStorage.setItem("riskit-username", trimmedName);
      setUserName(trimmedName);
      setShowNameInput(false);
    }
  };

  const handleSkapaOddsClick = () => {
    setShowDescriptionInput(true);
  };

  const handleDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/odds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          challengerName: userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate directly to the odds page
        router.push(`/${data.code}`);
      } else {
        console.error("Failed to create odds");
      }
    } catch (error) {
      console.error("Error creating odds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOddsaClick = () => {
    if (code.trim()) {
      router.push(`/${code.trim().toUpperCase()}`);
    }
  };

  const handleCancelDescription = () => {
    setShowDescriptionInput(false);
    setDescription("");
  };

  // Show name input view first
  if (showNameInput) {
    return (
      <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 gap-6">
        <h1 className="text-xl font-medium text-white text-center">
          Välkommen till RiskIt!
        </h1>
        <form
          onSubmit={handleNameSubmit}
          className="flex flex-col gap-3 items-center w-full max-w-xs"
        >
          <input
            type="text"
            placeholder="Ange ditt namn"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white text-center w-full"
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

  // Show description input view when creating odds
  if (showDescriptionInput) {
    return (
      <div className="font-sans flex flex-col items-center justify-start pt-12 min-h-screen p-4 gap-4">
        <div className="text-center">
          <h2 className="text-lg font-medium text-white">Skapa odds</h2>
          <p className="text-xs text-gray-400 mt-1">
            Beskriv vad du vill utmana någon att göra
          </p>
        </div>

        <form
          onSubmit={handleDescriptionSubmit}
          className="flex flex-col gap-3 items-center w-full max-w-xs"
        >
          <input
            placeholder="Utmana!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white w-full resize-none text-sm max-w-full"
            required
            autoFocus
          />

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleCancelDescription}
              className="rounded border border-solid border-white/20 transition-colors flex items-center justify-center hover:bg-gray-700 hover:border-transparent font-medium text-sm h-10 px-4 flex-1 text-white"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-4 disabled:opacity-50 flex-1"
            >
              {isLoading ? "Skapar..." : "Skapa"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Show main odds view after name is set
  return (
    <div className="font-sans flex flex-col items-center justify-start min-h-screen p-4 pt-12 gap-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-white">Hej {userName}!</h2>
        <button
          onClick={() => {
            localStorage.removeItem("riskit-username");
            setShowNameInput(true);
            setUserName("");
            setInputName("");
          }}
          className="text-xs text-gray-400 hover:text-white underline mt-1"
        >
          Byt namn
        </button>
      </div>

      <button
        onClick={handleSkapaOddsClick}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-6 w-full max-w-xs"
      >
        Skapa odds!
      </button>

      <div className="flex items-center w-full max-w-xs">
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="px-3 text-xs text-gray-400">eller</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      <div className="flex gap-2 items-center w-full max-w-xs">
        <input
          type="text"
          placeholder="Ange kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-white/20 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white flex-1 text-sm"
        />
        <button
          onClick={handleOddsaClick}
          disabled={!code.trim()}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black hover:bg-gray-300 font-medium text-sm h-10 px-4 disabled:opacity-50"
        >
          {">"}
        </button>
      </div>

      <div className="flex items-center w-full max-w-xs">
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="px-3 text-xs text-gray-400">eller</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      <button
        onClick={() => router.push("/history")}
        className="text-xs text-gray-400 hover:text-white underline"
      >
        Titta på tidigare odds
      </button>
    </div>
  );
}
