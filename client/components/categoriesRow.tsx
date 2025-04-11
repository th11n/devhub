"use client";

import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function CategoriesRow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get("filterBy");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(filter ?? null);

  const { data, error, isLoading } = useSWR(`/api/categories`, fetcher);

  const handleFilter = (category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("filterBy");
      params.set("page", "1");
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      setSelectedCategory(category);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      params.set("filterBy", category);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-row justify-center mb-12 gap-3 overflow-x-auto px-4 py-2">
        <Skeleton className="h-8 w-20 bg-white/5 rounded-full" />
        <Skeleton className="h-8 w-28 bg-white/5 rounded-full" />
        <Skeleton className="h-8 w-16 bg-white/5 rounded-full" />
        <Skeleton className="h-8 w-24 bg-white/5 rounded-full" />
        <Skeleton className="h-8 w-18 bg-white/5 rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error.info.message}</div>;
  }

  return (
    <div className="w-full flex flex-row justify-center mb-12 gap-3 flex-wrap z-10 px-4 py-2">
      {data.data.map((category: string) => {
        const isSelected = category === selectedCategory;
        return (
          <Badge
            onClick={() => {
              handleFilter(category);
            }}
            key={category}
            className={`
              z-10 cursor-pointer px-4 py-1.5 text-sm font-medium transition-all duration-300 ease-in-out
              ${isSelected 
                ? "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30" 
                : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white backdrop-blur-sm"}
              rounded-full border-0 hover:scale-105`}
            variant={isSelected ? "default" : "outline"}
          >
            {category}
          </Badge>
        );
      })}
    </div>
  );
}