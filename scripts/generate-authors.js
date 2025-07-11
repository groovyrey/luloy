const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const codeDir = path.join(process.cwd(), 'public', 'code');
const outputFile = path.join(codeDir, 'authors.json');

async function generateAuthors() {
  try {
    const files = fs.readdirSync(codeDir);
    const authorData = {};

    for (const filename of files) {
      const filePath = path.join(codeDir, filename);
      try {
        const author = execSync(`git log --diff-filter=A --format="%an" --max-count=1 -- "${filePath}"`, { encoding: 'utf8', cwd: process.cwd() }).trim();
        authorData[filename] = author || 'Unknown';
      } catch (gitError) {
        console.warn(`Could not get author for ${filename}: ${gitError.message}`);
        authorData[filename] = 'Unknown';
      }
    }

    fs.writeFileSync(outputFile, JSON.stringify(authorData, null, 2));
    console.log(`Generated ${outputFile}`);
  } catch (error) {
    console.error('Error generating authors.json:', error);
    process.exit(1);
  }
}

generateAuthors();
