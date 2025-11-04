import { Metadata } from "next";
import { Footer } from "@/modules/home/footer";
import { Header } from "@/modules/home/header";
import { cn } from "@/lib/utils"; // Make sure this is imported if you use `cn`

export const metadata: Metadata = {
  title: {
    template: "VobeCode - Editor",
    default: "Code Editor For VibeCoders - Vibecode",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {/* Background Grid */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[40px_40px]", // ✅ canonical form
          "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

      {/* Radial Mask Overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center 
        bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] 
        dark:bg-black"
      />

      {/* Page Content */}
      <main className="z-20 relative w-full pt-0">{children}</main>

      <Footer />
    </>
  );
}
