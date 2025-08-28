import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

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

// Firestore repository for odds
class OddsRepository {
  private static instance: OddsRepository;
  private collectionName: string;

  private constructor() {
    if (!process.env.NEXT_PUBLIC_FIREBASE_COLLECTION_NAME) {
      throw new Error(
        "NEXT_PUBLIC_FIREBASE_COLLECTION_NAME is not defined in environment variables."
      );
    }
    this.collectionName = process.env.NEXT_PUBLIC_FIREBASE_COLLECTION_NAME;
  }

  // Singleton pattern - ensure only one instance exists
  public static getInstance(): OddsRepository {
    if (!OddsRepository.instance) {
      OddsRepository.instance = new OddsRepository();
    }
    return OddsRepository.instance;
  }

  // Convert Firestore document to OddsDocument
  private convertFromFirestore(doc: DocumentData, code: string): OddsDocument {
    return {
      ...doc,
      code,
      createdAt: doc.createdAt?.toDate() || new Date(),
      gameResult: doc.gameResult
        ? {
            ...doc.gameResult,
            completedAt: doc.gameResult.completedAt?.toDate() || new Date(),
          }
        : undefined,
    } as OddsDocument;
  }

  // Convert OddsDocument to Firestore format
  private convertToFirestore(
    document: Omit<OddsDocument, "code">
  ): DocumentData {
    const firestoreDoc: DocumentData = {
      description: document.description,
      challenger: document.challenger,
      createdAt: Timestamp.fromDate(document.createdAt),
    };

    // Only add optional fields if they exist
    if (document.challengee) {
      firestoreDoc.challengee = document.challengee;
    }

    if (document.max !== undefined) {
      firestoreDoc.max = document.max;
    }

    if (document.gameResult) {
      firestoreDoc.gameResult = {
        ...document.gameResult,
        completedAt: Timestamp.fromDate(document.gameResult.completedAt),
      };
    }

    return firestoreDoc;
  }

  // Create a new odds document
  public async create(
    code: string,
    description: string,
    challengerName: string
  ): Promise<OddsDocument> {
    const document: Omit<OddsDocument, "code"> = {
      description,
      challenger: {
        name: challengerName,
      },
      createdAt: new Date(),
    };

    const docRef = doc(db, this.collectionName, code);
    await setDoc(docRef, this.convertToFirestore(document));

    return { ...document, code };
  }

  // Get odds document by code
  public async getByCode(code: string): Promise<OddsDocument | undefined> {
    try {
      const docRef = doc(db, this.collectionName, code);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertFromFirestore(docSnap.data(), code);
      }
      return undefined;
    } catch (error) {
      console.error("Error getting document:", error);
      return undefined;
    }
  }

  // Get all odds documents
  public async getAll(): Promise<OddsDocument[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) =>
        this.convertFromFirestore(doc.data(), doc.id)
      );
    } catch (error) {
      console.error("Error getting all documents:", error);
      return [];
    }
  }

  // Check if code exists
  public async exists(code: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, code);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking if document exists:", error);
      return false;
    }
  }

  // Update odds document
  public async update(
    code: string,
    updates: Partial<Omit<OddsDocument, "code">>
  ): Promise<OddsDocument | undefined> {
    try {
      const docRef = doc(db, this.collectionName, code);

      // Convert updates to Firestore format
      const firestoreUpdates: Record<string, unknown> = {};

      // Only add fields that are actually being updated
      Object.keys(updates).forEach((key) => {
        const value = updates[key as keyof typeof updates];
        if (value !== undefined) {
          if (key === "createdAt" && value instanceof Date) {
            firestoreUpdates[key] = Timestamp.fromDate(value);
          } else if (
            key === "gameResult" &&
            value &&
            typeof value === "object" &&
            "completedAt" in value
          ) {
            firestoreUpdates[key] = {
              ...value,
              completedAt: Timestamp.fromDate(value.completedAt as Date),
            };
          } else {
            firestoreUpdates[key] = value;
          }
        }
      });

      await updateDoc(docRef, firestoreUpdates);

      // Return the updated document
      return await this.getByCode(code);
    } catch (error) {
      console.error("Error updating document:", error);
      return undefined;
    }
  }

  // Delete odds document
  public async delete(code: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, code);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  // Get total count
  public async count(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.size;
    } catch (error) {
      console.error("Error counting documents:", error);
      return 0;
    }
  }

  // Get completed games only
  public async getCompleted(): Promise<OddsDocument[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("gameResult", "!=", null)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        this.convertFromFirestore(doc.data(), doc.id)
      );
    } catch (error) {
      console.error("Error getting completed games:", error);
      return [];
    }
  }
}

export default OddsRepository;
