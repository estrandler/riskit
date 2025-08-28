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
      <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <h1 className="text-xl font-medium text-foreground text-center">
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
            className="border border-black/[.08] dark:border-white/[.145] rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-center w-full"
            required
            autoFocus
          />
          <button
            type="submit"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-5 w-full"
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
      <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <div className="text-center">
          <h2 className="text-lg font-medium text-foreground">Skapa odds</h2>
          <p className="text-xs text-foreground/60 mt-1">
            Beskriv vad du vill utmana någon att göra
          </p>
        </div>

        <form
          onSubmit={handleDescriptionSubmit}
          className="flex flex-col gap-3 items-center w-full max-w-sm"
        >
          <textarea
            placeholder="Beskriv utmaningen..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-black/[.08] dark:border-white/[.145] rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground w-full h-20 resize-none text-sm"
            required
            autoFocus
          />

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleCancelDescription}
              className="rounded border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4 flex-1"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4 disabled:opacity-50 flex-1"
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
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Hej {userName}!</h2>
        <button
          onClick={() => {
            localStorage.removeItem("riskit-username");
            setShowNameInput(true);
            setUserName("");
            setInputName("");
          }}
          className="text-xs text-foreground/60 hover:text-foreground underline mt-1"
        >
          Byt namn
        </button>
      </div>

      <button
        onClick={handleSkapaOddsClick}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-6 w-full max-w-xs"
      >
        skapa odds
      </button>

      <div className="flex gap-2 items-center w-full max-w-xs">
        <input
          type="text"
          placeholder="kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-black/[.08] dark:border-white/[.145] rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground flex-1 text-sm text-center"
        />
        <button
          onClick={handleOddsaClick}
          disabled={!code.trim()}
          className="rounded border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4 disabled:opacity-50"
        >
          oddsa!
        </button>
      </div>
    </div>
  );
}
