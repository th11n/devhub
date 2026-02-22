import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ResourceCardProps } from "@/types/resource-card";

export default function ResourceCard({
  title,
  desc,
  image,
  url,
  category,
}: ResourceCardProps) {
  const displayTitle = title.length > 64 ? `${title.slice(0, 64)}…` : title;
  const displayDesc = desc.length > 120 ? `${desc.slice(0, 120)}…` : desc;

  return (
    <Link
      href={url}
      className="
        group relative block min-h-[340px] overflow-hidden rounded-2xl
        bg-neutral-950
        ring-1 ring-white/10
        transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60
      "
    >
      <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="
      absolute inset-[-100%] 
      animate-[spin_7s_linear_infinite] 
      bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(255,255,255,0.5)_360deg)]
    "
        />
      </div>

      <div className="absolute inset-[1px] z-[1] overflow-hidden rounded-[15px] bg-neutral-950">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover scale-[1.08] transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(16,185,129,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>

        <div className="absolute left-4 top-4 z-20">
          <Badge className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md">
            {category}
          </Badge>
        </div>

        <div className="absolute bottom-0 z-20 w-full p-5">
          <h3 className="text-[18px] md:text-[19px] font-semibold leading-snug text-white/95 transition-colors duration-300 group-hover:text-emerald-200">
            {displayTitle}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-200/80">
            {displayDesc}
          </p>
        </div>
      </div>
    </Link>
  );
}