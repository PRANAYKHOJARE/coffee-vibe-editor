"use client";

import Image from "next/image";
import SignInFormClient from "@/modules/auth/components/sign-in-form-client";

const Page = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src="/login.svg"
        alt="Login"
        width={220}
        height={220}
        priority
        className="mb-6"
      />

      <h1 className="text-3xl font-bold text-white">Welcome Back 👋</h1>

      <p className="mt-2 mb-8 text-zinc-300">
        Sign in with Google to continue.
      </p>

      <div className="w-full">
        <SignInFormClient />
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Secure authentication powered by Google
      </p>
    </div>
  );
};

export default Page;
