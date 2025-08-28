import { NextResponse } from "next/server";
import OddsRepository from "@/lib/odds-repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const repository = OddsRepository.getInstance();
    const { code } = await params;

    // Get odds document by code
    const oddsDocument = await repository.getByCode(code);

    if (!oddsDocument) {
      return NextResponse.json({ error: "Odds not found" }, { status: 404 });
    }

    return NextResponse.json(oddsDocument);
  } catch (error) {
    console.error("Error fetching odds:", error);
    return NextResponse.json(
      { error: "Failed to fetch odds" },
      { status: 500 }
    );
  }
}
