"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome, Github } from "lucide-react";
import {
  handleGoogleSignIn,
  handleGithubSignIn,
} from "@/modules/auth/actions/index";

const SignInFormClient = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-900">
      <Card className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Google Sign-In */}
          <form action={handleGoogleSignIn}>
            <Button
              type="submit"
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <Chrome className="mr-2 h-4 w-4" />
              <span>Sign in with Google</span>
            </Button>
          </form>

          {/* GitHub Sign-In */}
          <form action={handleGithubSignIn}>
            <Button
              type="submit"
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <Github className="mr-2 h-4 w-4" />
              <span>Sign in with GitHub</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-center text-gray-400 w-full">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInFormClient;
