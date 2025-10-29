import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { downloadFromGoogleDrive } from "@/lib/google-drive-server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in with Google" },
        { status: 401 }
      );
    }

    const result = await downloadFromGoogleDrive(session.accessToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to download from Google Drive" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Data successfully downloaded from Google Drive",
    });
  } catch (error: any) {
    console.error("Error in download API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

