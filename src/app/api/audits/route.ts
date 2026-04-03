import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
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

export async function GET() {
  try {
    const db = await getMongoDb();
    await ensureNormalizedIndexes(db);
    const audits = (await db
      .collection<AuditRecord>(COLLECTIONS.audits)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as AuditRecord[];
    return NextResponse.json({ audits });
  } catch (error) {
    console.error("Audits load error:", error);
    return NextResponse.json(
      { error: "Failed to load audits" },
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

    const newAudit: AuditRecord = {
      id: randomUUID(),
      auditorId: payload.auditorId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      status: payload.status ?? "pending",
      remarks: payload.remarks,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection<AuditRecord>(COLLECTIONS.audits).insertOne(newAudit);
    const updatedAudits = (await db
      .collection<AuditRecord>(COLLECTIONS.audits)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as AuditRecord[];

    return NextResponse.json({ audits: updatedAudits });
  } catch (error) {
    console.error("Audit create error:", error);
    return NextResponse.json(
      { error: "Failed to create audit" },
      { status: 500 },
    );
  }
}
