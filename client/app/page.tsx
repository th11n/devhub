import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[#0c0c0c] w-full px-12 py-6 overflow-y-auto pt-40 relative min-h-screen">
      <Link href="/resources" className="text-white">go to resources</Link>
    </div>
  );
}
