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
    const { response, playerName, isChallenger } = body;

    // Validate required fields
    if (response === undefined || !playerName || isChallenger === undefined) {
      return NextResponse.json(
        { error: "Response, player name, and role are required" },
        { status: 400 }
      );
    }

    if (typeof response !== "number" || response < 0) {
      return NextResponse.json(
        { error: "Response must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get existing odds document
    const existingOdds = await repository.getByCode(code);
    if (!existingOdds) {
      return NextResponse.json({ error: "Odds not found" }, { status: 404 });
    }

    if (existingOdds.max === undefined) {
      return NextResponse.json(
        { error: "Max value not set yet" },
        { status: 400 }
      );
    }

    if (response > existingOdds.max) {
      return NextResponse.json(
        { error: `Response must be between 1 and ${existingOdds.max}` },
        { status: 400 }
      );
    }

    // Check if this player has already responded
    if (isChallenger && existingOdds.challenger.response !== undefined) {
      return NextResponse.json(
        { error: "Challenger has already responded" },
        { status: 409 }
      );
    }

    if (!isChallenger && existingOdds.challengee?.response !== undefined) {
      return NextResponse.json(
        { error: "Challengee has already responded" },
        { status: 409 }
      );
    }

    // Update the appropriate player's response
    const updates: Partial<import("@/lib/odds-repository").OddsDocument> = {};

    if (isChallenger) {
      updates.challenger = {
        ...existingOdds.challenger,
        response: response,
      };
    } else {
      updates.challengee = {
        ...existingOdds.challengee,
        response: response,
      };
    }

    // Check if both players have now responded
    const otherPlayerHasResponded = isChallenger
      ? existingOdds.challengee?.response !== undefined
      : existingOdds.challenger.response !== undefined;

    if (otherPlayerHasResponded) {
      // Both players have responded, calculate the game result
      const challengerResponse = isChallenger
        ? response
        : existingOdds.challenger.response!;
      const challengeeResponse = !isChallenger
        ? response
        : existingOdds.challengee!.response!;

      const winner =
        challengerResponse === challengeeResponse ? "challenger" : "challengee";

      updates.gameResult = {
        winner,
        challengerResponse,
        challengeeResponse,
        completedAt: new Date(),
      };
    }

    const updatedOdds = await repository.update(code, updates);

    if (!updatedOdds) {
      return NextResponse.json(
        { error: "Failed to update odds" },
        { status: 500 }
      );
    }

    // Build response object
    const responseData: Record<string, unknown> = {
      code: updatedOdds.code,
      challenger: updatedOdds.challenger,
      challengee: updatedOdds.challengee,
      gameResult: updatedOdds.gameResult,
      message: "Response submitted successfully",
    };

    // Add challengee response for cheat users if it exists

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
