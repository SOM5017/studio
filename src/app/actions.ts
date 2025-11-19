
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSessionCookie, getAuth, signInWithEmailAndPassword, verifySessionCookie } from "@/firebase/admin";


export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (email !== "admin1234" || password !== "admin1234") {
    return { error: "Invalid username or password." };
  }

  try {
    // Note: We use a hardcoded email for Firebase Auth, as it doesn't support username-only login.
    const userCredential = await signInWithEmailAndPassword(getAuth(), 'admin@example.com', password);
    const idToken = await userCredential.user.getIdToken();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await createSessionCookie(idToken, { expiresIn });
    cookies().set("session", sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });

  } catch (error: any) {
    console.error("Firebase sign-in error:", error.code);
    // Handle specific Firebase auth errors if needed
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      return { error: "Invalid username or password." };
    }
    return { error: "An unexpected error occurred. Please try again." };
  }

  revalidatePath("/owner");
  redirect("/owner");
}

export async function logoutAction() {
  cookies().delete("session");
  redirect("/login");
}

export async function getSession() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}
