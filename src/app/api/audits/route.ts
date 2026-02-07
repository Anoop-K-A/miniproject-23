import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";

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
    const audits = await readJsonFile<AuditRecord[]>("audits.json");
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
    const payload = await request.json();
    const audits = await readJsonFile<AuditRecord[]>("audits.json");
    const timestamp = new Date().toISOString();

    const newAudit: AuditRecord = {
      id: Date.now().toString(),
      auditorId: payload.auditorId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      status: payload.status ?? "pending",
      remarks: payload.remarks,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedAudits = [newAudit, ...audits];
    await writeJsonFile("audits.json", updatedAudits);

    return NextResponse.json({ audits: updatedAudits });
  } catch (error) {
    console.error("Audit create error:", error);
    return NextResponse.json(
      { error: "Failed to create audit" },
      { status: 500 },
    );
  }
}
