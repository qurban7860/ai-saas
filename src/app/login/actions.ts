"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import prisma from "@/lib/prisma";

export async function loginWithCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  // Basic email format validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    redirect("/login?error=invalid-email");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Login error:", error);
    redirect("/login?error=login-failed");
  }
}

export async function loginWithGoogle() {
  try {
    await signIn("google", { redirectTo: "/" });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Google login error:", error);
    redirect("/login?error=google-failed");
  }
}
