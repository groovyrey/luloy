import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { firestore } from './firebase-admin'; // Import firestore

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the slug and add default values
    return {
      slug,
      title: matterResult.data.title || 'Untitled Post',
      date: matterResult.data.date || new Date().toISOString(),
      description: matterResult.data.description || 'No description available.',
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}

export async function getPostData(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section and content
  const matterResult = matter(fileContents);

  let authorDetails = null;
  const author = matterResult.data.author;
  const isUid = /^[a-zA-Z0-9]{20,40}$/.test(author);

  if (isUid) {
    try {
      const userDoc = await firestore.collection('users').doc(author).get();
      if (userDoc.exists) {
        authorDetails = userDoc.data();
      } else {
        console.warn(`User document not found for UID: ${author}`);
      }
    } catch (error) {
      console.error(`Error fetching author details from Firestore for UID ${author}:`, error);
    }
  }

  // Combine the data with the slug and contentHtml, providing defaults
  return {
    slug,
    content: matterResult.content,
    authorDetails,
    title: matterResult.data.title || 'Untitled Post',
    date: matterResult.data.date || new Date().toISOString(),
    author: matterResult.data.author || 'Unknown Author',
    description: matterResult.data.description || 'No description available.',
    ...matterResult.data,
  };
}
