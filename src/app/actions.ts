"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "firebase-admin";
import { cookies } from "next/headers";

export async function logoutAction() {
    cookies().delete("session");
    revalidatePath("/");
    redirect("/");
}
