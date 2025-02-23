"use client";

import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function CategoriesRow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get("filterBy");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(filter ?? null)
  
  const { data, error, isLoading } = useSWR(`/api/categories`, fetcher);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleFilter = (category: string) => {
    if (category === selectedCategory) {
        setSelectedCategory(null)
        const params = new URLSearchParams(searchParams.toString());
        params.delete('filterBy')
        router.replace(`?${params.toString()}`, { scroll: false });
    } else {
        setSelectedCategory(category)
        createQueryString('filterBy', category)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex flex-row justify-center mb-12 gap-2 overflow-x-auto">
        <Skeleton className="h-5 w-18 bg-white/5 !rounded-md" />
        <Skeleton className="h-5 w-24 bg-white/5 !rounded-md" />
        <Skeleton className="h-5 w-12 bg-white/5 !rounded-md" />
        <Skeleton className="h-5 w-28 bg-white/5 !rounded-md" />
        <Skeleton className="h-5 w-14 bg-white/5 !rounded-md" />
        <Skeleton className="h-5 w-32 bg-white/5 !rounded-md" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error.info.message}</div>;
  }

  return (
    <div className="w-full flex flex-row justify-center mb-12 gap-2 flex-wrap z-[10]">
      {data.data.map((category: string) => {
        return (
          <Badge onClick={() => {handleFilter(category)}} key={category} className={`z-[10] cursor-pointer ${category === selectedCategory ? "shadow-[0px_0px_30px_0px_rgba(0,_153,_102,_0.3)]" : ""}`}>
            {category}
          </Badge>
        );
      })}
    </div>
  );
}
