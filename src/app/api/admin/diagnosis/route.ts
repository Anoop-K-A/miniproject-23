import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Firebase Diagnostic Report ===");

    // 1. List all collections
    console.log("Listing all collections...");
    let collections: string[] = [];
    try {
      const collectionsSnapshot = await adminDb.listCollections();
      collections = collectionsSnapshot.map((c) => c.id);
      console.log("Available collections:", collections);
    } catch (error: any) {
      console.warn("Could not list collections:", error.message);
    }

    // 2. Check users collection
    let userStats = {
      total: 0,
      approved: 0,
      pending: 0,
      users: [] as any[],
    };

    try {
      const usersSnapshot = await adminDb.collection("users").get();
      console.log(`Total users found: ${usersSnapshot.size}`);

      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        userStats.total++;

        if (data.approved) {
          userStats.approved++;
        } else {
          userStats.pending++;
        }

        userStats.users.push({
          id: doc.id,
          email: data.email,
          name: data.name || data.displayName,
          approved: data.approved,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
        });
      });
    } catch (error: any) {
      if (!(error.code === 5 || error.message?.includes("NOT_FOUND"))) {
        console.error("Error fetching users:", error.message);
      }
    }

    // 3. Check Firebase Auth users
    let authUsers = {
      total: 0,
      users: [] as any[],
    };

    try {
      let pageToken: string | undefined;
      do {
        const authSnapshot = await adminAuth.listUsers(1000, pageToken);
        authUsers.total += authSnapshot.users.length;
        authUsers.users.push(
          ...authSnapshot.users.map((u) => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            createdAt: u.metadata?.creationTime,
          })),
        );
        pageToken = authSnapshot.pageToken;
      } while (pageToken);
    } catch (error: any) {
      console.warn("Could not fetch Firebase Auth users:", error.message);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      collections,
      firestore: userStats,
      auth: authUsers,
      summary: {
        firestoreUsers: userStats.total,
        fireAuthUsers: authUsers.total,
        approved: userStats.approved,
        pending: userStats.pending,
      },
    });
  } catch (error: any) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate diagnostic report",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
