import Link from "next/link";
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-8 sm:px-6">
        <div className="text-center space-y-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Developed by{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
              Pranay Khojare
            </span>
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} CodeSnippet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;