import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { ArrowUpRight } from "lucide-react";

interface PostProps {
  title: string;
  desc: string;
  image: string;
  url: string;
  category: string;
}

export default function PostCard({
  title,
  desc,
  image,
  url,
  category,
}: PostProps) {
  const displayTitle =
    title.length > 60 ? `${title.substring(0, 60)}...` : title;
  const displayDesc = desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;

  return (
    <Link
      href={url}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-neutral-900 shadow-lg shadow-neutral-800/30 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-700/30 min-h-[320px]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          className="object-cover transition-all duration-500 scale-110 group-hover:scale-100"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-75"></div>
      </div>

      <div className="absolute top-3 left-3 z-10">
        <Badge className="bg-neutral-800/80 text-xs font-medium uppercase tracking-wider text-emerald-400 backdrop-blur-sm px-2.5 py-0.5 group-hover:bg-emerald-400 group-hover:text-black transition-all duration-300">
          {category}
        </Badge>
      </div>

      <div className="absolute bottom-0 z-10 w-full p-4">
        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300 mb-1.5">
          {displayTitle}
        </h3>

        <p className="text-sm text-neutral-300 font-light mb-3 leading-snug">
          {displayDesc}
        </p>

        <div className="flex items-center text-xs text-neutral-400 group-hover:text-emerald-400 transition-colors duration-300">
          <span className="mr-1.5 font-medium">Read more</span>
          <ArrowUpRight
            size={14}
            className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </Link>
  );
}
