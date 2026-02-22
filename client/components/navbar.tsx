import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { PackagePlus, ArrowUpRight } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: string;
  active?: boolean;
}

export function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 mx-auto w-full max-w-6xl px-4">
      <div
        className="
          relative flex items-center justify-between
          rounded-2xl px-4 py-2
          bg-black/25 backdrop-blur-xl
          ring-1 ring-white/10
          shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)]
          transition-all duration-300
        "
      >
        <div
          className="
            pointer-events-none absolute inset-0 overflow-hidden rounded-2xl
            after:absolute after:-left-40 after:top-0 after:h-full after:w-40 after:rotate-12
            after:bg-white/10 after:blur-xl after:opacity-0
            after:transition-all after:duration-700
            hover:after:left-[110%] hover:after:opacity-100
          "
        />

        <Link href="/" className="relative flex items-center gap-3">
          <div
            className="
              relative grid place-items-center
              h-11 w-11 sm:h-12 sm:w-12
            "
          >
            <Image
              src="/logo.png"
              alt="Devhub Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            className="
              relative overflow-hidden rounded-xl px-4 sm:px-5
              bg-emerald-500/90 text-black
              hover:bg-emerald-400/90
              shadow-[0_12px_40px_-18px_rgba(16,185,129,0.65)]
              ring-1 ring-emerald-300/30
              transition-all duration-300
              hover:-translate-y-[1px]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60
            "
          >
            <Link href="/add-resource" className="group flex items-center gap-2">
              <PackagePlus className="size-5" />
              <span className="hidden sm:inline font-medium">Add Resource</span>
              <ArrowUpRight className="size-4 opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, active }) => {
  return (
    <Link
      href={href}
      className={[
        "relative hidden sm:inline-flex items-center",
        "h-10 px-3 rounded-xl text-sm",
        "transition-all duration-300",
        "text-neutral-300 hover:text-white",
        "hover:bg-white/5 hover:ring-1 hover:ring-white/10",
        active ? "bg-white/5 text-white ring-1 ring-white/10" : "",
      ].join(" ")}
    >
      <span className="relative">
        {children}
        <span
          className={[
            "absolute -bottom-2 left-0 h-[2px] w-full rounded-full",
            "bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0",
            "opacity-0 transition-opacity duration-300",
            active ? "opacity-100" : "group-hover:opacity-100",
          ].join(" ")}
        />
      </span>
    </Link>
  );
};