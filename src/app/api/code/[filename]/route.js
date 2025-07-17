import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export async function GET(request, { params }) {
  const { filename: rawFilename } = params;
  const filename = rawFilename;
  const filePath = path.join(process.cwd(), 'public', 'code', filename);
  

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    let author = 'Unknown';
    let authorEmail = '';
    try {
      const gitLogArgs = [
        'log',
        '--diff-filter=A',
        '--format=%an%n%ae',
        '--max-count=1',
        '--',
        filePath,
      ];

      const gitProcess = spawn('git', gitLogArgs, { encoding: 'utf8', cwd: process.cwd() });

      let stdout = '';
      let stderr = '';

      gitProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      await new Promise((resolve, reject) => {
        gitProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`git command exited with code ${code}: ${stderr}`));
          }
        });
        gitProcess.on('error', (err) => {
          reject(err);
        });
      });

      const gitLogOutput = stdout.trim();
      const [name, email] = gitLogOutput.split('\n');
      author = name || 'Unknown';
      authorEmail = email || '';
    } catch (gitError) {
      console.error(`Error getting git log for ${filename}:`, gitError.message);
    }

    return NextResponse.json({ content, filename, author, authorEmail });
  } catch (error) {
    console.error(`Failed to read file ${filename}:`, error);
    return NextResponse.json({ error: 'File not found or cannot be read' }, { status: 404 });
  }
}