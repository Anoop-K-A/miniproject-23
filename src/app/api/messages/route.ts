import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";

interface AuditorMessage {
  id: string;
  facultyId: string;
  auditorId?: string;
  entityType: "course-file" | "event-report" | string;
  entityId: string;
  threadId?: string;
  senderRole?: "auditor" | "faculty" | string;
  senderName?: string;
  message: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const resolveThreadId = (message: AuditorMessage) =>
  message.threadId ?? `${message.entityType}:${message.entityId}`;

export async function GET(request: NextRequest) {
  try {
    const facultyId = request.nextUrl.searchParams.get("facultyId");
    const auditorId = request.nextUrl.searchParams.get("auditorId");
    const threadId = request.nextUrl.searchParams.get("threadId");
    const messages = await readJsonFile<AuditorMessage[]>(
      "auditorMessages.json",
    );
    let filtered = messages;
    if (facultyId) {
      filtered = filtered.filter((msg) => msg.facultyId === facultyId);
    }
    if (auditorId) {
      filtered = filtered.filter((msg) => msg.auditorId === auditorId);
    }
    if (threadId) {
      filtered = filtered.filter((msg) => resolveThreadId(msg) === threadId);
    }
    return NextResponse.json({ messages: filtered });
  } catch (error) {
    console.error("Messages load error:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const messages = await readJsonFile<AuditorMessage[]>(
      "auditorMessages.json",
    );
    const timestamp = new Date().toISOString();

    const newMessage: AuditorMessage = {
      id: Date.now().toString(),
      facultyId: payload.facultyId,
      auditorId: payload.auditorId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      threadId: payload.threadId,
      senderRole: payload.senderRole,
      senderName: payload.senderName,
      message: payload.message ?? "",
      status: payload.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedMessages = [newMessage, ...messages];
    await writeJsonFile("auditorMessages.json", updatedMessages);

    return NextResponse.json({ messages: updatedMessages });
  } catch (error) {
    console.error("Message create error:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const threadId = request.nextUrl.searchParams.get("threadId");
    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 },
      );
    }

    const messages = await readJsonFile<AuditorMessage[]>(
      "auditorMessages.json",
    );
    const updatedMessages = messages.filter(
      (msg) => resolveThreadId(msg) !== threadId,
    );

    await writeJsonFile("auditorMessages.json", updatedMessages);

    return NextResponse.json({ messages: updatedMessages });
  } catch (error) {
    console.error("Message delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 },
    );
  }
}
