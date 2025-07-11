import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'code');
  
  try {
    const files = fs.readdirSync(dir).map(filename => {
      const filePath = path.join(dir, filename);
      const stats = fs.statSync(filePath);
      
      let author = 'Unknown';
      try {
        // Get the author of the first commit for the file
        author = execSync(`git log --diff-filter=A --format="%an" --max-count=1 -- "${filePath}"`, { encoding: 'utf8', cwd: process.cwd() }).trim();
        
      } catch (gitError) {
        
        // Ensure the file is still returned even if git author fails
      }

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
