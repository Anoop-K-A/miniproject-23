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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const audits = await readJsonFile<AuditRecord[]>("audits.json");
    const updatedAt = new Date().toISOString();

    const updatedAudits = audits.map((audit) =>
      audit.id === id
        ? {
            ...audit,
            ...payload,
            updatedAt,
          }
        : audit,
    );

    await writeJsonFile("audits.json", updatedAudits);
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
    const { id } = await params;
    const audits = await readJsonFile<AuditRecord[]>("audits.json");
    const updatedAudits = audits.filter((audit) => audit.id !== id);
    await writeJsonFile("audits.json", updatedAudits);
    return NextResponse.json({ audits: updatedAudits });
  } catch (error) {
    console.error("Audit delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 },
    );
  }
}
