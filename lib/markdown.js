
import { firestore } from './firebase-admin'; // Import firestore

// Helper function to serialize Firestore Timestamps
function serializeFirestoreTimestamps(data) {
  for (const key in data) {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate().toISOString();
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      serializeFirestoreTimestamps(data[key]);
    }
  }
  return data;
}

export async function getSortedPostsData() {
  const postsRef = firestore.collection('posts');
  const snapshot = await postsRef.orderBy('uploadedAt', 'desc').get();

  const allPostsData = snapshot.docs.map((doc) => {
    const data = serializeFirestoreTimestamps(doc.data());
    return {
      slug: data.slug,
      title: data.title || 'Untitled Post',
      date: data.uploadedAt ? data.uploadedAt : new Date().toISOString(), // uploadedAt is already serialized
      description: data.description || 'No description available.',
      ...data,
    };
  });

  return allPostsData;
}

export async function getAllPostSlugs() {
  const postsRef = firestore.collection('posts');
  const snapshot = await postsRef.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      params: {
        slug: data.slug,
      },
    };
  });
}

export async function getPostData(slug) {
  const postRef = firestore.collection('posts').where('slug', '==', slug);
  const snapshot = await postRef.get();

  if (snapshot.empty) {
    console.warn(`No post found with slug: ${slug}`);
    return null;
  }

  const postDoc = snapshot.docs[0];
  const postData = serializeFirestoreTimestamps(postDoc.data());

  const markdownBlobUrl = postData.markdownBlobUrl;

  if (!markdownBlobUrl) {
    console.error(`Post with slug ${slug} is missing markdownBlobUrl in Firestore.`);
    return null;
  }

  let fileContents = '';
  try {
    const response = await fetch(markdownBlobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown from Blob: ${response.statusText}`);
    }
    fileContents = await response.text();
  } catch (error) {
    console.error(`Error fetching markdown content for ${slug} from Blob:`, error);
    return null;
  }

  let authorDetails = null;
  const authorId = postData.uploadedBy; // Use uploadedBy as the author ID

  if (authorId) {
    try {
      const userDoc = await firestore.collection('users').doc(authorId).get();
      if (userDoc.exists) {
        authorDetails = serializeFirestoreTimestamps(userDoc.data());
      } else {
        console.warn(`User document not found for UID: ${authorId}`);
      }
    } catch (error) {
      console.error(`Error fetching author details from Firestore for UID ${authorId}:`, error);
    }
  }

  // Combine the data with the slug and contentHtml, providing defaults
  return {
    slug,
    content: fileContents, // Content is now just the raw fileContents
    authorDetails,
    title: postData.title || 'Untitled Post',
    date: postData.uploadedAt ? postData.uploadedAt : new Date().toISOString(),
    author: authorDetails ? (authorDetails.fullName || authorDetails.email) : 'Unknown Author',
    description: postData.description || 'No description available.',
    ...postData,
  };
}
