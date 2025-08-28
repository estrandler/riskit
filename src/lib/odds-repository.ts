// Types for our odds document
export interface Challenger {
  name: string;
  response?: number;
}

export interface Challengee {
  name?: string;
  response?: number;
}

export interface GameResult {
  winner: "challenger" | "challengee";
  challengerResponse: number;
  challengeeResponse: number;
  completedAt: Date;
}

export interface OddsDocument {
  code: string;
  description: string;
  challenger: Challenger;
  challengee?: Challengee;
  max?: number;
  gameResult?: GameResult;
  createdAt: Date;
}

// In-memory repository singleton for odds
class OddsRepository {
  private static instance: OddsRepository;
  private odds: Map<string, OddsDocument> = new Map();

  private constructor() {}

  // Singleton pattern - ensure only one instance exists
  public static getInstance(): OddsRepository {
    if (!OddsRepository.instance) {
      OddsRepository.instance = new OddsRepository();
    }
    return OddsRepository.instance;
  }

  // Create a new odds document
  public create(
    code: string,
    description: string,
    challengerName: string
  ): OddsDocument {
    const document: OddsDocument = {
      code,
      description,
      challenger: {
        name: challengerName,
      },
      createdAt: new Date(),
    };

    this.odds.set(code, document);
    return document;
  }

  // Get odds document by code
  public getByCode(code: string): OddsDocument | undefined {
    return this.odds.get(code);
  }

  // Get all odds documents
  public getAll(): OddsDocument[] {
    return Array.from(this.odds.values());
  }

  // Check if code exists
  public exists(code: string): boolean {
    return this.odds.has(code);
  }

  // Update odds document
  public update(
    code: string,
    updates: Partial<OddsDocument>
  ): OddsDocument | undefined {
    const existing = this.odds.get(code);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...updates };
    this.odds.set(code, updated);
    return updated;
  }

  // Delete odds document
  public delete(code: string): boolean {
    return this.odds.delete(code);
  }

  // Get total count
  public count(): number {
    return this.odds.size;
  }
}

export default OddsRepository;
