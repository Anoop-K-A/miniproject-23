import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongoDb";
import { COLLECTIONS, ensureNormalizedIndexes } from "@/lib/mongoNormalized";

interface AuditRecord {
  id: string;
  auditorId: string;
  entityType: string;
  entityId: string;
  status: string;
  remarks?: string;
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
      .collection<AuditRecord>(COLLECTIONS.audits)
      .updateOne({ id }, { $set: { ...payload, updatedAt } });
    const updatedAudits = (await db
      .collection<AuditRecord>(COLLECTIONS.audits)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as AuditRecord[];
    return NextResponse.json({ audits: updatedAudits });
  } catch (error) {
    console.error("Audit update error:", error);
    return NextResponse.json(
      { error: "Failed to update audit" },
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
    await db.collection<AuditRecord>(COLLECTIONS.audits).deleteOne({ id });
    const updatedAudits = (await db
      .collection<AuditRecord>(COLLECTIONS.audits)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as AuditRecord[];
    return NextResponse.json({ audits: updatedAudits });
  } catch (error) {
    console.error("Audit delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 },
    );
  }
}
