import { google } from "googleapis";
import { Client } from "@microsoft/microsoft-graph-client";

export const initializeGoogleDrive = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return google.drive({ version: "v3", auth: oauth2Client });
};

export const initializeOneDrive = () => {
  return Client.init({
    authProvider: (done) => {
      done(null, process.env.MICROSOFT_ACCESS_TOKEN!);
    },
  });
};

export const listGoogleDriveFiles = async (drive: any) => {
  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
    });
    return response.data.files;
  } catch (error) {
    console.error("Error listing Google Drive files:", error);
    throw error;
  }
};

export const listOneDriveFiles = async (client: any) => {
  try {
    const response = await client.api("/me/drive/root/children").get();
    return response.value;
  } catch (error) {
    console.error("Error listing OneDrive files:", error);
    throw error;
  }
};
