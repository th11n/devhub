"use client";

import Link from "next/link";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => (
  <Link
    href={href}
    className="text-neutral-500 hover:text-white transition-colors duration-200"
  >
    {children}
  </Link>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-neutral-500">

        <div className="text-center sm:text-left">
          © {currentYear} Devhub
        </div>

        {/* <div className="flex items-center gap-6">
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
        </div> */}

      </div>
    </footer>
  );
}