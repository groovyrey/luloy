import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function GET(request, { params }) {
  const { filename: rawFilename } = params;
  const filename = rawFilename;
  const filePath = path.join(process.cwd(), 'public', 'code', filename);
  

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    let author = 'Unknown';
    let authorEmail = '';
    try {
      // Get the author name and email of the first commit for the file
      const gitLogOutput = execSync(`git log --diff-filter=A --format="%an%n%ae" --max-count=1 -- "${filePath}"`, { encoding: 'utf8', cwd: process.cwd() }).trim();
      const [name, email] = gitLogOutput.split('\n');
      author = name || 'Unknown';
      authorEmail = email || '';
    } catch (gitError) {
      
    }

    return NextResponse.json({ content, filename, author, authorEmail });
  } catch (error) {
    console.error(`Failed to read file ${filename}:`, error);
    return NextResponse.json({ error: 'File not found or cannot be read' }, { status: 404 });
  }
}