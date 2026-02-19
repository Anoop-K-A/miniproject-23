import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";

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
    const { id } = await params;
    const payload = await request.json();
    const remarks = await readJsonFile<RemarkRecord[]>("remarks.json");
    const updatedAt = new Date().toISOString();

    const updatedRemarks = remarks.map((remark) =>
      remark.id === id
        ? {
            ...remark,
            ...payload,
            updatedAt,
          }
        : remark,
    );

    await writeJsonFile("remarks.json", updatedRemarks);
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
    const { id } = await params;
    const remarks = await readJsonFile<RemarkRecord[]>("remarks.json");
    const updatedRemarks = remarks.filter((remark) => remark.id !== id);
    await writeJsonFile("remarks.json", updatedRemarks);
    return NextResponse.json({ remarks: updatedRemarks });
  } catch (error) {
    console.error("Remark delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete remark" },
      { status: 500 },
    );
  }
}
