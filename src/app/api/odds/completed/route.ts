import { NextResponse } from "next/server";
import OddsRepository from "@/lib/odds-repository";

export async function GET() {
  try {
    const repository = OddsRepository.getInstance();

    // Get all odds documents and filter for completed ones
    const allOdds = repository.getAll();
    const completedOdds = allOdds.filter(
      (odds) => odds.gameResult !== undefined
    );

    // Sort by completion date (most recent first)
    completedOdds.sort((a, b) => {
      if (!a.gameResult || !b.gameResult) return 0;
      return (
        new Date(b.gameResult.completedAt).getTime() -
        new Date(a.gameResult.completedAt).getTime()
      );
    });

    return NextResponse.json(completedOdds);
  } catch (error) {
    console.error("Error fetching completed odds:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed odds" },
      { status: 500 }
    );
  }
}
