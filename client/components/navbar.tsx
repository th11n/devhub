import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { PackagePlus } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: string;
}

export function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 mx-auto max-w-6xl px-4 w-full flex justify-between items-center z-50">
      <div className="w-full flex justify-between items-center py-2 px-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/5 shadow-lg transition-all duration-300 hover:bg-black/30">
        <Link href="/" className="flex-shrink-0 relative overflow-hidden group">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14">
            <Image
              src="/logo.png"
              alt="Devhub Logo"
              fill
              className="object-contain transition-transform duration-400 group-hover:scale-90 group-hover:rotate-[-15deg]"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink href="/resources">Resources</NavLink>

          <Button
            asChild
            className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white ml-2 sm:ml-4 px-4 sm:px-5 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group"
          >
            <Link href="/add-resource">
              <span className="flex items-center gap-2 relative z-10 transition-transform duration-300 group-hover:-translate-y-[100px]">
                <PackagePlus className="size-5" />
                <span className="hidden sm:inline">Add Resource</span>
              </span>
              <span className="absolute left-0 flex items-center justify-center w-full gap-2 translate-y-[100px] transition-transform duration-300 group-hover:translate-y-0">
                <PackagePlus className="size-5" />
                <span className="hidden sm:inline">Add Resource</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm text-neutral-300 hover:text-white transition-colors duration-300 hidden sm:block group"
    >
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 ease-out group-hover:w-full"></span>
    </Link>
  );
};
