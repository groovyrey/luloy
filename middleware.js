
import { NextResponse } from "next/server";
import { getComputedPermissions } from "./src/app/utils/BadgeSystem";

export async function middleware(request) {
  const session = request.cookies.get("session");

  // Return to /login if don't have a session
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Call the authentication endpoint
    let responseAPI;
    try {
      responseAPI = await fetch(`${request.nextUrl.origin}/api/auth`, {
        headers: {
          Cookie: `session=${session?.value}`,
        },
      });
    } catch (error) {
      console.error("Error fetching auth API:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }

  // Return to /login if token is not authorized
  if (responseAPI.status !== 200) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userData = await responseAPI.json();
  console.log("Middleware: User data from API auth:", userData);
  const user = userData.user; // Extract user object from the response
  console.log("Middleware: User object:", user);
  console.log("Middleware: User badges:", user.badges);

  // Define paths that require authLevel 1
  const authLevel1Paths = ["/messages/private", "/user/update-authlevel"];

  // Check if the current path requires authLevel 1 and if the user has it
  if (authLevel1Paths.some(path => request.nextUrl.pathname.startsWith(path)) && user.authLevel !== 1) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check for canAssignBadges permission for /user/manage-badges
  if (request.nextUrl.pathname.startsWith("/user/manage-badges")) {
    const userPermissions = getComputedPermissions(user.badges || []);
    console.log("Middleware: Computed user permissions for manage-badges:", userPermissions);
    if (!userPermissions.canAssignBadges) {
      console.log("Middleware: Unauthorized access to manage-badges.");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

//Add your protected routes
export const config = {
  matcher: ["/home", "/messages/:path*", "/user/:path*", "/chat"],
};
