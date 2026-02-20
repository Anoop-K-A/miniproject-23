import { NextResponse } from "next/server";
import { migrateCourseFilesToFolders } from "@/lib/migrateFiles";

// Force Node.js runtime for file system operations
export const runtime = "nodejs";

/**
 * API endpoint to migrate existing course files into course code folders
 * GET /api/migrate-files
 */
export async function GET() {
  try {
    console.log("Migration API endpoint called");

    const result = await migrateCourseFilesToFolders();

    return NextResponse.json({
      success: true,
      message: "File migration completed",
      result,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to migrate files",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
