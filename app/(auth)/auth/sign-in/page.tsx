"use client";

import Image from "next/image";
import SignInFormClient from "@/modules/auth/components/sign-in-form-client";

const Page = () => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <div className="mb-4 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
        CodeSnippet
      </div>

      {/* Illustration */}
      <Image
        src="/login.svg"
        alt="Login"
        width={180}
        height={180}
        priority
        className="mb-5"
      />

      {/* Heading */}
      <h1 className="text-4xl font-bold tracking-tight text-white">
        Welcome Back 👋
      </h1>

      <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
        Continue your coding journey by signing in with your Google account.
      </p>

      {/* Login Button */}
      <div className="mt-8 w-full">
        <SignInFormClient />
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-zinc-500">
        🔒 Secure authentication powered by Google
      </p>
    </div>
  );
};

export default Page;
