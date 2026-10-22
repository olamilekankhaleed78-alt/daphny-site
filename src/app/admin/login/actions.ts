"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, checkPassword, createSessionToken } from "@/lib/auth";

export async function login(_prev: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return "Incorrect password";

  (await cookies()).set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/admin/login");
}
