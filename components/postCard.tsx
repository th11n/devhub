import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";

interface postProps {
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
}: postProps) {
  return (
    <>
      <Link href={url} className="border-neutral-200 bg-neutral-900/75 shadow-xs shadow-neutral-800 min-h-[320px] flex flex-col justify-between relative overflow-hidden rounded-lg group cursor-pointer">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title}
            className="object-cover scale-125 group-hover:scale-100 transition duration-[400ms]"
            height={1080}
            width={1920}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent backdrop-blur-xs group-hover:backdrop-blur-[0px] cursor-pointer transition duration-500"></div>
        </div>

        <Badge className="absolute top-2 right-2">{category}</Badge>

        {/* Title Section (Positioned Above Image) */}
        <div className="absolute bottom-0 w-full bg-[#0c0c0c]/50 backdrop-blur-md px-4 py-3 text-start">
          <h3 className="text-2xl text-white font-[family-name:var(--font-primary-sans)]">
            {title}
          </h3>
          <div className="flex flex-row justify-between items-end">
            <span className="text-sm text-neutral-300 font-thin">{desc}</span>
          </div>
        </div>
      </Link>
    </>
  );
}
