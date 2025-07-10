import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'code');
  
  try {
    const files = fs.readdirSync(dir).map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        mtime: stats.mtime.getTime(), // Convert to timestamp
      };
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error('Failed to read directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}
