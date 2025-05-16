import { google } from 'googleapis';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink)',
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileId } = await request.json();

    const file = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink',
    });

    return NextResponse.json(file.data);
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}