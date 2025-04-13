"use client";

import Link from "next/link";

interface RollTextLinkProps {
  href: string;
  text: string;
}

const RollTextLink: React.FC<RollTextLinkProps> = ({ href, text }) => {
  return (
    <Link 
      href={href}
      className="group relative overflow-hidden inline-block hover:text-white transition-colors duration-300"
    >
      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full text-neutral-400">
        {text}
      </span>
      <span className="absolute left-0 inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        {text}
      </span>
    </Link>
  );
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-6 border-t border-neutral-800/50 mt-auto bg-neutral-900/30 backdrop-blur-sm">
      <div className="w-full mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <div className="text-neutral-500 text-sm text-center inline-flex items-center gap-1">
          © {currentYear} by{" "}
          <RollTextLink href="https://github.com/th11n" text="Dominik Krakowiak." />{" "}
          Special thanks to{" "}
          <RollTextLink href="https://github.com/joachimhodana" text="Joachim Hodana." />
          <span className="text-neutral-500"> All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <RollTextLink href="/terms" text="Terms and Conditions" />
          <span className="h-4 w-px bg-neutral-700 hidden sm:block"></span>
          <RollTextLink href="/privacy" text="Privacy Policy" />
        </div>
      </div>
    </footer>
  );
}