import { NextResponse } from "next/server";
import OddsRepository from "@/lib/odds-repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const repository = OddsRepository.getInstance();
    const { code } = await params;
    const body = await request.json();
    const { max, challengeeName } = body;

    // Validate required fields
    if (max === undefined || !challengeeName) {
      return NextResponse.json(
        { error: "Max value and challengee name are required" },
        { status: 400 }
      );
    }

    if (typeof max !== "number" || max <= 0) {
      return NextResponse.json(
        { error: "Max value must be a positive number" },
        { status: 400 }
      );
    }

    // Get existing odds document
    const existingOdds = repository.getByCode(code);
    if (!existingOdds) {
      return NextResponse.json({ error: "Odds not found" }, { status: 404 });
    }

    // Check if max value is already set
    if (existingOdds.max !== undefined) {
      return NextResponse.json(
        { error: "Max value already set" },
        { status: 409 }
      );
    }

    // Update odds with max value and challengee info
    const updatedOdds = repository.update(code, {
      max,
      challengee: {
        name: challengeeName.trim(),
      },
    });

    if (!updatedOdds) {
      return NextResponse.json(
        { error: "Failed to update odds" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: updatedOdds.code,
      max: updatedOdds.max,
      challengee: updatedOdds.challengee,
      message: "Max value updated successfully",
    });
  } catch (error) {
    console.error("Error updating max value:", error);
    return NextResponse.json(
      { error: "Failed to update max value" },
      { status: 500 }
    );
  }
}
