import { NextResponse } from "next/server";
import OddsRepository from "@/lib/odds-repository";

// Function to generate a 4-character code in format AA11
function generateCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Generate 2 random letters
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];

  // Generate 2 random numbers
  const number1 = numbers[Math.floor(Math.random() * numbers.length)];
  const number2 = numbers[Math.floor(Math.random() * numbers.length)];

  return `${letter1}${letter2}${number1}${number2}`;
}

// Generate a unique code that doesn't already exist
function generateUniqueCode(): string {
  const repository = OddsRepository.getInstance();
  let code: string;

  // Keep generating until we get a unique code
  do {
    code = generateCode();
  } while (repository.exists(code));

  return code;
}

export async function POST(request: Request) {
  try {
    const repository = OddsRepository.getInstance();

    // Parse the request body to get description and challenger name
    const body = await request.json();
    const { description, challengerName } = body;

    // Validate required fields
    if (!description || !challengerName) {
      return NextResponse.json(
        { error: "Description and challenger name are required" },
        { status: 400 }
      );
    }

    // Generate a new unique 4-character code
    const code = generateUniqueCode();

    // Save the code to the in-memory repository with description and challenger
    const oddsDocument = repository.create(
      code,
      description.trim(),
      challengerName.trim()
    );

    return NextResponse.json(
      {
        code: oddsDocument.code,
        description: oddsDocument.description,
        challenger: oddsDocument.challenger,
        createdAt: oddsDocument.createdAt,
        message: "Odds code generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating odds code:", error);
    return NextResponse.json(
      { error: "Failed to generate odds code" },
      { status: 500 }
    );
  }
}
