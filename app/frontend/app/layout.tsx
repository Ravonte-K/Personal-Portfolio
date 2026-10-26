import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import NavTabs from "./nav-tabs";

export const metadata = {
  title: "Ravonte Kriegler | Portfolio",
  description: "Ravonte Kriegler, a Villanova computer science student with an intended math double major, building ML and data projects in Python."
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
        <footer className="site-footer">
          <div className="site-footer-inner">
            <p>© 2026 Ravonte Kriegler</p>
            <nav className="footer-links" aria-label="Contact">
              <a href="mailto:ravontek@icloud.com">ravontek@icloud.com</a>
              <a href="https://github.com/Ravonte-K" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/ravonte-kriegler" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://drive.google.com/file/d/1szXp4RbZRObedDPV52D9rVIzqpqBPw6r/view?usp=sharing" target="_blank" rel="noreferrer">Resume (PDF)</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
