import { File } from '@/app/models/File';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const file = await File.findById(id);

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Extract labels metadata
    const labels = file.labels || {};
    const subject = labels.subject || 'Not specified';
    const topic = labels.topic || 'Not specified';
    const educatorType = labels.educatorType || 'Unknown';

    return NextResponse.json({
      id: file.id,
      name: file.original_name,
      subject,
      topic,
      educatorType,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      uploadDate: file.upload_date,
      createdAt: file.created_at,
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
