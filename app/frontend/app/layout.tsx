import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import NavTabs from "./nav-tabs";

export const metadata = {
  title: "Portfolio",
  description: "Personal portfolio"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="brand-mark">
              Ravonte Kriegler
            </Link>
            <NavTabs />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
