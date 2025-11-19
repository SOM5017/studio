
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// The server actions are now simplified.
// The complex session management is removed.
// We will rely on client-side auth state.

export async function logoutAction() {
  // Client-side will handle actual sign out.
  // This action just clears any related cookies if they exist
  // and redirects to login.
  cookies().delete("session");
  redirect("/login");
}
