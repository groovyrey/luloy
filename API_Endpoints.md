# API Endpoints Documentation

This document outlines the API endpoints available in the application, their functionalities, and expected behaviors.

## Authentication & Authorization

### `/api/auth`
- **GET**: Checks if a user session is active and returns user's `authLevel` and `badges` if logged in.
  - **Authentication**: Requires a session cookie.
  - **Responses**:
    - `200 OK`: `{ isLogged: true, user: { authLevel: <level>, badges: [...] } }`
    - `401 Unauthorized`: `{ isLogged: false }` or `{ isLogged: false, message: <error> }`

### `/api/auth/reset-password`
- **POST**: Sends a password reset email to the provided email address.
  - **Rate Limiting**: 3 requests per minute per IP.
  - **Request Body**: `{ email: string }`
  - **Responses**:
    - `200 OK`: `{ message: 'Password reset email sent.' }`
    - `400 Bad Request`: `{ error: 'Invalid JSON in request body.' }` or `{ error: 'Valid email is required' }`
    - `429 Too Many Requests`: `{ error: 'Too many password reset requests. Please try again later.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to send password reset email.' }`

### `/api/login`
- **POST**: Authenticates a user with an ID token and sets a session cookie.
  - **Rate Limiting**: 5 requests per minute per IP.
  - **Request Body**: `{ idToken: string }`
  - **Responses**:
    - `200 OK`: `{ status: 'success' }`
    - `400 Bad Request`: `{ message: 'Invalid JSON in request body.' }`
    - `429 Too Many Requests`: `{ message: 'Too many requests. Please try again later.' }`

### `/api/logout`
- **GET**: Clears the user's session cookie, effectively logging them out.
  - **Responses**:
    - `200 OK`: `{ status: 'success' }`

### `/api/signup`
- **POST**: Registers a new user with provided details and saves them to Firestore.
  - **Rate Limiting**: 5 requests per minute per IP.
  - **Request Body**: `{ idToken: string, firstName: string, lastName: string, age: number }`
  - **Responses**:
    - `200 OK`: `{ message: 'User data saved successfully.' }`
    - `400 Bad Request`: `{ error: 'Invalid JSON in request body.' }`, `{ error: 'Missing or invalid user data.' }`, or validation errors for name/age.
    - `429 Too Many Requests`: `{ message: 'Too many requests. Please try again later.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to save user data.' }`

## Code Snippets

### `/api/code-snippets/:snippetId`
- **GET**: Retrieves a specific code snippet by its ID.
  - **Responses**:
    - `200 OK`: `{ ...snippetData }`
    - `400 Bad Request`: `{ error: 'Snippet ID is required' }`
    - `404 Not Found`: `{ error: 'Snippet not found' }`
    - `500 Internal Server Error`: `{ error: 'Failed to fetch code snippet' }`
- **PUT**: Updates an existing code snippet.
  - **Authentication**: Requires a valid session and ownership of the snippet.
  - **Request Body**: `{ filename?: string, description?: string, codeBlobUrl?: string }`
  - **Responses**:
    - `200 OK`: `{ message: 'Snippet updated successfully' }`
    - `400 Bad Request`: `{ error: 'Snippet ID is required' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized: No session found' }` or `{ error: 'Unauthorized: Invalid session' }`
    - `403 Forbidden`: `{ error: 'Forbidden: You do not own this snippet' }`
    - `404 Not Found`: `{ error: 'Snippet not found' }`
    - `500 Internal Server Error`: `{ error: 'Failed to update code snippet' }`
- **DELETE**: Deletes a specific code snippet and its associated blob from Vercel Blob.
  - **Authentication**: Requires a valid session and ownership of the snippet.
  - **Responses**:
    - `200 OK`: `{ message: 'Snippet deleted successfully' }`
    - `400 Bad Request`: `{ error: 'Snippet ID is required' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized: No session found' }` or `{ error: 'Unauthorized: Invalid session' }`
    - `403 Forbidden`: `{ error: 'Forbidden: You do not own this snippet' }`
    - `404 Not Found`: `{ error: 'Snippet not found' }`
    - `500 Internal Server Error`: `{ error: 'Failed to delete code snippet' }`

### `/api/user-snippets/:userId`
- **GET**: Retrieves all code snippets for a given user ID, ordered by creation date.
  - **Responses**:
    - `200 OK`: `[ { id: string, ...snippetData }, ... ]`
    - `400 Bad Request`: `{ error: 'User ID is required' }`
    - `500 Internal Server Error`: `{ error: 'Failed to fetch user snippets' }`

## Messages

### `/api/messages/:id`
- **GET**: Retrieves a specific message by its ID.
  - **Responses**:
    - `200 OK`: `{ id: string, ...messageData }`
    - `404 Not Found`: `{ message: 'Message not found' }`
    - `500 Internal Server Error`: `{ message: 'Internal server error' }`
- **PUT**: Updates an existing message.
  - **Request Body**: `{ message: string, sender: string }`
  - **Responses**:
    - `200 OK`: `{ message: 'Message updated successfully' }`
    - `500 Internal Server Error`: `{ message: 'Internal server error' }`

### `/api/messages/delete`
- **POST**: Deletes a message.
  - **Authentication**: Requires an ID token and `authLevel` of 1 (staff).
  - **Request Body**: `{ messageId: string }`
  - **Responses**:
    - `200 OK`: `{ message: 'Message deleted successfully' }`
    - `400 Bad Request`: `{ message: 'Invalid JSON in request body.' }` or `{ message: 'Bad Request: Message ID is required.' }`
    - `401 Unauthorized`: `{ message: 'Unauthorized' }`
    - `403 Forbidden`: `{ message: 'Forbidden: Insufficient authorization' }`
    - `404 Not Found`: `{ message: 'Not Found: Message not found' }`
    - `500 Internal Server Error`: `{ message: 'Internal Server Error' }`

### `/api/messages/update-visibility`
- **POST**: Updates the `private` status of a message.
  - **Authentication**: Requires an ID token and `authLevel` of 1 (staff).
  - **Request Body**: `{ messageId: string, private: boolean }`
  - **Responses**:
    - `200 OK`: `{ message: 'Message visibility updated successfully' }`
    - `400 Bad Request`: `{ message: 'Invalid JSON in request body.' }`, `{ message: 'Bad Request: Message ID is required and must be a non-empty string.' }`, or `{ message: "'private' status must be a boolean." }`
    - `401 Unauthorized`: `{ message: 'Unauthorized' }`
    - `403 Forbidden`: `{ message: 'Forbidden: Insufficient permissions' }`
    - `404 Not Found`: `{ message: 'Not Found: Message not found' }`
    - `500 Internal Server Error`: `{ message: 'Internal Server Error' }`

## Posts

### `/api/posts/:slug`
- **DELETE**: Deletes a post and its associated blob from Vercel Blob.
  - **Authentication**: Requires a valid session and the user to have the 'staff' badge.
  - **Responses**:
    - `200 OK`: `{ message: 'Post deleted successfully' }`
    - `400 Bad Request`: `{ error: 'Slug is required' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized: No session found' }` or `{ error: 'Unauthorized: Invalid session' }`
    - `403 Forbidden`: `{ error: 'Forbidden: Only staff members can delete posts' }`
    - `404 Not Found`: `{ error: 'Post not found' }`
    - `500 Internal Server Error`: `{ error: 'Failed to delete post' }`

### `/api/user-posts`
- **POST**: Creates a new user post.
  - **Authentication**: Requires a valid session.
  - **Request Body**: `{ title: string, content: string }`
  - **Responses**:
    - `201 Created`: `{ message: 'Post created successfully', postId: string }`
    - `400 Bad Request`: `{ message: 'Title and content are required' }`
    - `401 Unauthorized`: `{ message: 'Unauthorized' }`
    - `404 Not Found`: `{ message: 'User not found' }`
    - `413 Payload Too Large`: `{ message: 'Post content is too large' }`
    - `500 Internal Server Error`: `{ message: 'Internal Server Error' }`

## Uploads

### `/api/upload`
- **POST**: Uploads a file to Vercel Blob and saves its metadata to Firestore.
  - **Authentication**: Requires a valid session.
  - **Query Parameters**: `filename`, `type` ('post' or 'code'), `title` (for posts), `description` (for posts/code), `language` (for code).
  - **Request Body**: File content.
  - **Responses**:
    - `200 OK`: `{ ...blobData, firestoreDocId: string }`
    - `400 Bad Request`: `{ error: 'Filename and type are required' }` or `{ error: 'Invalid upload type' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized: No session found' }` or `{ error: 'Unauthorized: Invalid session' }`
    - `500 Internal Server Error`: `{ error: 'Failed to upload file or save metadata' }`

## User Management

### `/api/user/:id`
- **GET**: Retrieves public profile data for a specific user by UID.
  - **Responses**:
    - `200 OK`: `{ uid: string, firstName: string, lastName: string, fullName: string, email: string, age: number, bio: string | null, profilePictureUrl: string | null, badges: string[], lastFieldUpdates: { [key: string]: number } }`
    - `404 Not Found`: `{ error: 'User not found.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to fetch user data.' }`

### `/api/user/check-email`
- **GET**: Checks if an email address already exists in the user database.
  - **Query Parameters**: `email`
  - **Responses**:
    - `200 OK`: `{ exists: true }` or `{ exists: false }`
    - `400 Bad Request`: `{ error: 'Email is required.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to check user email.' }`

### `/api/user/reset-password`
- **POST**: Forces a password reset for a specified user (admin functionality).
  - **Authentication**: Requires an ID token from a user with `canManageUsers` permission.
  - **Request Body**: `{ uid: string, newPassword: string }`
  - **Responses**:
    - `200 OK`: `{ message: 'Password reset successfully.' }`
    - `400 Bad Request`: `{ error: 'New password must be at least 6 characters long.' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized' }`
    - `403 Forbidden`: `{ error: 'Forbidden: Insufficient permissions.' }`
    - `404 Not Found`: `{ error: 'Requesting user not found.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to force password reset.' }`

### `/api/user/search`
- **GET**: Searches for users by their full name.
  - **Query Parameters**: `query`
  - **Responses**:
    - `200 OK`: `[ { id: string, firstName: string, lastName: string, profilePictureUrl: string | null, authLevel: number }, ... ]`
    - `400 Bad Request`: `{ error: 'Search query is required.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to search users.' }`

### `/api/user/staff`
- **GET**: Retrieves a list of all users with the 'staff' badge.
  - **Responses**:
    - `200 OK`: `[ { id: string, firstName: string, lastName: string, email: string, profilePictureUrl: string | null, authLevel: number, badges: string[] }, ... ]`
    - `500 Internal Server Error`: `{ error: 'Failed to fetch staff users.' }`

### `/api/user/update`
- **PUT**: Updates a user's profile information (first name, last name, age, bio, authLevel).
  - **Request Body**: `{ uid: string, firstName: string, lastName: string, age: number, bio?: string, authLevel?: number }`
  - **Responses**:
    - `200 OK`: `{ message: 'User data updated successfully.' }` or `{ message: 'No changes to update.' }`
    - `400 Bad Request`: Validation errors for missing/invalid fields.
    - `404 Not Found`: `{ error: 'User not found.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to update user data.' }`

### `/api/user/update-authlevel`
- **PUT**: Updates a user's authorization level.
  - **Request Body**: `{ uid: string, authLevel: number }`
  - **Responses**:
    - `200 OK`: `{ message: 'User auth level updated successfully.' }`
    - `400 Bad Request`: Validation errors for missing/invalid UID or authLevel.
    - `500 Internal Server Error`: `{ error: 'Failed to update user auth level.' }`

### `/api/user/update-badges`
- **PUT**: Updates a user's badges.
  - **Authentication**: Requires an ID token from a user with `canAssignBadges` permission.
  - **Request Body**: `{ uid: string, badges: string[] }`
  - **Responses**:
    - `200 OK`: `{ message: 'User badges updated successfully.' }`
    - `400 Bad Request`: `{ error: 'Invalid request: UID and badges array are required.' }`
    - `401 Unauthorized`: `{ error: 'Unauthorized' }` or `{ error: 'Unauthorized: Invalid token' }`
    - `403 Forbidden`: `{ error: 'Forbidden: Insufficient permissions' }`
    - `404 Not Found`: `{ error: 'Target user not found.' }`
    - `500 Internal Server Error`: `{ error: 'Internal Server Error' }`

### `/api/user/upload-profile-picture`
- **POST**: Uploads a profile picture to Cloudinary and updates the user's profile URL in Firestore.
  - **Request Body**: `formData` containing `uid` and `file`.
  - **Responses**:
    - `200 OK`: `{ message: 'Profile picture uploaded successfully.', url: string }`
    - `400 Bad Request`: Validation errors for missing/invalid UID, file, file type, or file size.
    - `500 Internal Server Error`: `{ error: 'Failed to upload profile picture.' }`
- **DELETE**: Deletes a user's profile picture from Cloudinary and removes the URL from Firestore.
  - **Query Parameters**: `uid`
  - **Responses**:
    - `200 OK`: `{ message: 'Profile picture removed successfully.' }`
    - `400 Bad Request`: `{ error: 'Missing UID.' }`
    - `500 Internal Server Error`: `{ error: 'Failed to remove profile picture.' }`

## Other

### `/api/command`
- **GET**: Executes an `ls -F` command on the server.
  - **Authentication**: Requires a valid session and `authLevel` of 1.
  - **Responses**:
    - `200 OK`: `{ output: string, error: string }`
    - `401 Unauthorized`: `{ message: 'Unauthorized' }`
    - `403 Forbidden`: `{ message: 'Forbidden: Insufficient authorization' }`
    - `500 Internal Server Error`: `{ error: 'Failed to execute command' }` or `{ message: 'Internal Server Error' }`
