const fs = require('fs');

// Get the filename and content from the command-line arguments
const filename = process.argv[2];
const content = process.argv[3];

// Check if the filename and content are provided
if (!filename || !content) {
  console.error('Please provide a filename and content as arguments.');
  process.exit(1);
}

// Write the content to the file
fs.writeFile(filename, content, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
    process.exit(1);
  }

  console.log(`Successfully created ${filename} with the provided content.`);
});
