import { NextResponse } from "next/server";
import OddsRepository from "@/lib/odds-repository";

export async function GET() {
  try {
    const repository = OddsRepository.getInstance();

    // Get completed odds documents using the new method
    const completedOdds = await repository.getCompleted();

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
