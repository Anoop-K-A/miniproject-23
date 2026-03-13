import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("Health check endpoint called");

    // Try to verify Firestore connection
    let collectionsList: string[] = [];
    try {
      const testCollection = await adminDb.listCollections();
      collectionsList = testCollection.map((c) => c.id);
      console.log("Available collections:", collectionsList);
    } catch (listError: any) {
      console.warn("Could not list collections:", listError.message);
    }

    // Try to query users collection (but handle NOT_FOUND gracefully)
    let usersCollectionExists = false;
    let userCount = 0;
    try {
      const usersSnapshot = await adminDb.collection("users").limit(1).get();
      usersCollectionExists = true;
      userCount = usersSnapshot.size;
    } catch (usersError: any) {
      if (usersError.code === 5 || usersError.message?.includes("NOT_FOUND")) {
        console.log("Users collection does not exist yet");
        usersCollectionExists = false;
      } else {
        console.warn("Error querying users:", usersError.message);
      }
    }

    return NextResponse.json({
      status: "ok",
      firebaseConnected: true,
      collections: collectionsList,
      usersCollectionExists,
      userCount,
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        code: error.code,
      },
      { status: 500 },
    );
  }
}
