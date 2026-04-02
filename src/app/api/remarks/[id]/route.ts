import { NextRequest, NextResponse } from "next/server";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const { id } = await params;
    const payload = await request.json();
    const updatedAt = new Date().toISOString();

    await db
      .collection<RemarkRecord>(COLLECTIONS.remarks)
      .updateOne({ id }, { $set: { ...payload, updatedAt } });
    const updatedRemarks = (await db
      .collection<RemarkRecord>(COLLECTIONS.remarks)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as RemarkRecord[];
    return NextResponse.json({ remarks: updatedRemarks });
  } catch (error) {
    console.error("Remark update error:", error);
    return NextResponse.json(
      { error: "Failed to update remark" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const { id } = await params;
    await db.collection<RemarkRecord>(COLLECTIONS.remarks).deleteOne({ id });
    const updatedRemarks = (await db
      .collection<RemarkRecord>(COLLECTIONS.remarks)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as RemarkRecord[];
    return NextResponse.json({ remarks: updatedRemarks });
  } catch (error) {
    console.error("Remark delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete remark" },
      { status: 500 },
    );
  }
}
