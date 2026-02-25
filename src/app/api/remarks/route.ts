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

export async function GET() {
  try {
    const remarks = await readJsonFile<RemarkRecord[]>("remarks.json");
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
    const payload = await request.json();
    const remarks = await readJsonFile<RemarkRecord[]>("remarks.json");
    const timestamp = new Date().toISOString();

    const newRemark: RemarkRecord = {
      id: Date.now().toString(),
      authorId: payload.authorId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      status: payload.status ?? "draft",
      text: payload.text ?? "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedRemarks = [newRemark, ...remarks];
    await writeJsonFile("remarks.json", updatedRemarks);

    return NextResponse.json({ remarks: updatedRemarks });
  } catch (error) {
    console.error("Remark create error:", error);
    return NextResponse.json(
      { error: "Failed to create remark" },
      { status: 500 },
    );
  }
}
