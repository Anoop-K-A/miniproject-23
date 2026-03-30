import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    {
      error: "Email verification has been disabled.",
      code: "EMAIL_VERIFICATION_DISABLED",
    },
    { status: 410 },
  );
}
