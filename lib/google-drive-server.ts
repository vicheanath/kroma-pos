import { google } from "googleapis";
import type { ExportData } from "./data-portability";

const FILE_NAME = "kroma-pos-backup.json";
const FOLDER_NAME = "Kroma POS Backups";

/**
 * Initialize Google Drive API client with access token (server-side)
 */
function getDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.drive({ version: "v3", auth: oauth2Client });
}

/**
 * Find or create the backup folder in Google Drive
 */
async function getOrCreateBackupFolder(drive: any): Promise<string> {
  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Create folder if it doesn't exist
    const folderResponse = await drive.files.create({
      requestBody: {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    return folderResponse.data.id!;
  } catch (error) {
    console.error("Error managing backup folder:", error);
    throw new Error("Failed to access Google Drive folder");
  }
}

/**
 * Find existing backup file in the folder
 */
async function findBackupFile(
  drive: any,
  folderId: string
): Promise<string | null> {
  try {
    const response = await drive.files.list({
      q: `name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`,
      fields: "files(id, name, modifiedTime)",
    });

    if (response.data.files && response.data.files.length > 0) {
      // Return the most recent file
      return response.data.files[0].id!;
    }

    return null;
  } catch (error) {
    console.error("Error finding backup file:", error);
    return null;
  }
}

/**
 * Upload data to Google Drive (server-side)
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  data: ExportData
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const drive = getDriveClient(accessToken);
    
    // Convert data to JSON string and then to Buffer
    const jsonData = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonData, "utf-8");

    // Get or create backup folder
    const folderId = await getOrCreateBackupFolder(drive);

    // Check for existing file
    const existingFileId = await findBackupFile(drive, folderId);

    const fileMetadata = {
      name: FILE_NAME,
      parents: [folderId],
    };

    if (existingFileId) {
      // Update existing file
      await drive.files.update({
        fileId: existingFileId,
        requestBody: fileMetadata,
        media: {
          mimeType: "application/json",
          body: buffer,
        },
        fields: "id, name, modifiedTime",
      });

      return {
        success: true,
        fileId: existingFileId,
      };
    } else {
      // Create new file
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: "application/json",
          body: buffer,
        },
        fields: "id, name, createdTime",
      });

      return {
        success: true,
        fileId: response.data.id!,
      };
    }
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error);
    return {
      success: false,
      error: error.message || "Failed to upload to Google Drive",
    };
  }
}

/**
 * Download data from Google Drive (server-side)
 */
export async function downloadFromGoogleDrive(
  accessToken: string
): Promise<{ success: boolean; data?: ExportData; error?: string }> {
  try {
    const drive = getDriveClient(accessToken);

    // Get backup folder
    const folderId = await getOrCreateBackupFolder(drive);

    // Find backup file
    const fileId = await findBackupFile(drive, folderId);

    if (!fileId) {
      return {
        success: false,
        error: "No backup file found in Google Drive",
      };
    }

    // Download file
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      }
    );

    // Parse JSON data
    const buffer = Buffer.from(response.data as ArrayBuffer);
    const text = buffer.toString("utf-8");
    const data = JSON.parse(text) as ExportData;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error downloading from Google Drive:", error);
    return {
      success: false,
      error: error.message || "Failed to download from Google Drive",
    };
  }
}

