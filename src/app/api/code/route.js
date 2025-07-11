import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'code');

  try {
    const publicCodeFiles = fs.readdirSync(dir).map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      
      const fileData = {
        filename,
        size: stats.size,
        mtime: stats.mtime.getTime(),
      };
      
      return fileData;
    });

    return NextResponse.json(publicCodeFiles);

  } catch (error) {
    console.error('Failed to read directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}

