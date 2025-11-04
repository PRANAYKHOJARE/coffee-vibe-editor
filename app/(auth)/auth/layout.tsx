import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex justify-center items-center h-screen flex-col bg-zinc-900">
      <div className="bg-white/90 p-6 rounded-2xl shadow-lg">{children}</div>
    </main>
  );
};

export default AuthLayout;
