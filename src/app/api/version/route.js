import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return NextResponse.json({ version: packageJson.version });
  } catch (error) {
    console.error('Error reading package.json:', error);
    return NextResponse.json({ error: 'Failed to read version' }, { status: 500 });
  }
}
