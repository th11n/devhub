"use client";

import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories } from "@/lib/actions/get-categories";

export function CategoriesRow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get("filterBy");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(filter ?? null);
  const [data, setData] = useState<string[] | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getCategories()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (category === selectedCategory) {
      setSelectedCategory(null);
      params.delete("filterBy");
    } else {
      setSelectedCategory(category);
      params.set("filterBy", category);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex flex-row justify-center mb-12 gap-3 overflow-x-auto px-4 py-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 bg-white/5 rounded-full" />
        ))}
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center mb-12">{error.message}</div>;
  if (!data) return null;

  return (
    <div className="w-full flex flex-row justify-center mb-16 gap-3 flex-wrap z-10 px-4">
      {data.map((category: string) => {
        const isSelected = category === selectedCategory;
        return (
          <button
            key={category}
            onClick={() => handleFilter(category)}
            className="group relative"
          >
            {/* --- BACKGROUND & SHADOW EFFECT --- */}
            <Badge
              className={`
                relative z-10 px-5 py-2 text-[13px] font-medium tracking-wide
                transition-all duration-300 ease-out rounded-full border
                backdrop-blur-md cursor-pointer
                
                ${isSelected
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                }
              `}
            >
              {category}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}