import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getMongoDb } from "@/lib/mongoDb";
import { COLLECTIONS, ensureNormalizedIndexes } from "@/lib/mongoNormalized";

interface RemarkRecord {
  id: string;
  authorId: string;
  entityType: string;
  entityId: string;
  status: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const remarks = (await db
      .collection<RemarkRecord>(COLLECTIONS.remarks)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as RemarkRecord[];
    return NextResponse.json({ remarks });
  } catch (error) {
    console.error("Remarks load error:", error);
    return NextResponse.json(
      { error: "Failed to load remarks" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const payload = await request.json();
    const timestamp = new Date().toISOString();

    const newRemark: RemarkRecord = {
      id: randomUUID(),
      authorId: payload.authorId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      status: payload.status ?? "draft",
      text: payload.text ?? "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection<RemarkRecord>(COLLECTIONS.remarks).insertOne(newRemark);
    const updatedRemarks = (await db
      .collection<RemarkRecord>(COLLECTIONS.remarks)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as RemarkRecord[];

    return NextResponse.json({ remarks: updatedRemarks });
  } catch (error) {
    console.error("Remark create error:", error);
    return NextResponse.json(
      { error: "Failed to create remark" },
      { status: 500 },
    );
  }
}
