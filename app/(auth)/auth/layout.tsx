import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
