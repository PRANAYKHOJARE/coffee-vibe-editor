"use server";

import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";

// 🔹 Sign-In Handlers
export async function handleGoogleSignIn() {
  await signIn("google");
}

export async function handleGithubSignIn() {
  await signIn("github");
}

// 🔹 Get User By ID
export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        accounts: true,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 🔹 Get Account By User ID
export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: { userId },
    });
    return account;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 🔹 Get Current User
export const currentUser = async () => {
  const user = await auth();
  return user?.user;
};
