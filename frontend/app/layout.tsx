import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Portfolio",
  description: "Personal portfolio shell"
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Resume", href: "/resume" }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <span className="text-lg font-semibold">Your Name</span>
            <div className="flex gap-6 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
