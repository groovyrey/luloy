import { admin } from "/lib/firebase-admin.js";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const uid = formData.get("uid");
    const file = formData.get("file");

    if (!uid || typeof uid !== 'string' || uid.trim().length === 0) {
      console.error("Validation Error: Missing or invalid UID for profile picture upload.");
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (!file) {
      console.error(`Validation Error for UID ${uid}: No file provided for upload.`);
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // Validate file type (e.g., only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error(`Validation Error for UID ${uid}: Invalid file type provided: ${file.type}`);
      return NextResponse.json({ error: "Only JPEG, PNG, GIF, and WEBP images are allowed." }, { status: 400 });
    }

    // Validate file size (e.g., max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.error(`Validation Error for UID ${uid}: File size exceeds limit. Size: ${file.size} bytes.`);
      return NextResponse.json({ error: "File size exceeds the 5MB limit." }, { status: 400 });
    }

    // Fetch current user data to check for existing profile picture
    const userDocRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    // If an old profile picture exists, delete it from Cloudinary
    if (userData && userData.profilePictureUrl) {
      try {
        // Assuming public_id is the UID as set during upload
        await cloudinary.uploader.destroy(`profile_pictures/${uid}`);
        console.log("Old profile picture deleted from Cloudinary for UID:", uid);
      } catch (deleteError) {
        console.error("Error deleting old profile picture from Cloudinary:", deleteError);
        // Continue with upload even if old picture deletion fails
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "profile_pictures",
          public_id: uid, // Use UID as public ID for easy retrieval
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });

    console.log("Cloudinary upload successful. Secure URL:", uploadResult.secure_url);

    await admin.firestore().collection("users").doc(uid).update({
      profilePictureUrl: uploadResult.secure_url,
    });

    console.log("Profile picture URL saved to Firestore for UID:", uid);

    revalidatePath('/');
    return NextResponse.json({ message: "Profile picture uploaded successfully.", url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json({ error: "Failed to upload profile picture." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing UID." }, { status: 400 });
    }

    // Delete the profile picture from Cloudinary
    try {
      await cloudinary.uploader.destroy(`profile_pictures/${uid}`);
      console.log("Profile picture deleted from Cloudinary for UID:", uid);
    } catch (deleteError) {
      console.error("Error deleting profile picture from Cloudinary:", deleteError);
      // Continue to update Firestore even if Cloudinary deletion fails
    }

    // Remove the profilePictureUrl from Firestore
    await admin.firestore().collection("users").doc(uid).update({
      profilePictureUrl: admin.firestore.FieldValue.delete(),
    });

    console.log("Profile picture URL removed from Firestore for UID:", uid);

    revalidatePath('/');
    return NextResponse.json({ message: "Profile picture removed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return NextResponse.json({ error: "Failed to remove profile picture." }, { status: 500 });
  }
}