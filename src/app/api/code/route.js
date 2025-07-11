import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'code');
  const authorsFilePath = path.join(dir, 'authors.json');
  let authors = {};

  try {
    const authorsFileContent = fs.readFileSync(authorsFilePath, 'utf8');
    authors = JSON.parse(authorsFileContent);
  } catch (error) {
    console.warn('Could not read authors.json, defaulting to unknown authors:', error.message);
  }

  try {
    const files = fs.readdirSync(dir).map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      
      const author = authors[filename] || 'Unknown';

      const fileData = {
        filename,
        size: stats.size,
        mtime: stats.mtime.getTime(), // Convert to timestamp
        author,
      };
      
      return fileData;
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error('Failed to read directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}
