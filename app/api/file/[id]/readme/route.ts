import { File } from '@/app/models/File';
import LocalFileStorage from '@/lib/fileStorage';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

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

    // Get README path from metadata
    const readmePath = file.metadata?.readmePath;

    if (!readmePath) {
      return NextResponse.json(
        { error: 'README file not found for this document' },
        { status: 404 }
      );
    }

    // Read the README file content
    const readmeContent = await fs.readFile(readmePath, 'utf-8');

    return NextResponse.json({
      content: readmeContent,
      fileId: file.id,
      fileName: file.original_name,
    });
  } catch (error) {
    console.error('Error fetching README:', error);
    return NextResponse.json(
      { error: 'Failed to fetch README content' },
      { status: 500 }
    );
  }
}
