import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToGoogleDrive } from "@/lib/google-drive-server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in with Google" },
        { status: 401 }
      );
    }

    // Export data from IndexedDB (this needs to happen client-side, so we'll receive it in request body)
    // For now, we'll get it from request body since we can't access IndexedDB server-side
    const body = await request.json();
    const data = body.data;
    
    if (!data) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    const result = await uploadToGoogleDrive(session.accessToken, data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to upload to Google Drive" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      message: "Data successfully uploaded to Google Drive",
    });
  } catch (error: any) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

