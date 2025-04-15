"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ResourceCard from "@/components/resourceCard";
import { Spinner } from "@/components/spinner";
import { getResources } from "@/lib/actions/get-resources";
import { Resource } from "@/types/resource";

export default function ResourceGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("filterBy");
  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ data: Resource[]; pageCount: number } | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const pageNumber = searchParams.get("page");
    setPageIndex(
      pageNumber && !isNaN(Number(pageNumber)) ? Number(pageNumber) - 1 : 0
    );
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getResources(pageIndex, category)
      .then((res) => {
        setData(res);
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [pageIndex, category]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const changePage = (page: number) => {
    createQueryString("page", (page + 1).toString());
    setPageIndex(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[69vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error?.info?.message || "Something went wrong"}
      </div>
    );
  }

  if (!data || pageIndex > data.pageCount - 1 || pageIndex < 0) {
    return (
      <Link className="text-white" href="/">
        Back to home
      </Link>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-between">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-[10]">
        {data.data.map((resource) => (
          <ResourceCard
            key={resource.id}
            title={resource.title}
            desc={resource.body}
            image={resource.image}
            url={resource.url}
            category={resource.category}
          />
        ))}
      </div>
      <Pagination className="text-white mt-12 mb-6">
        <PaginationContent>
          <PaginationItem
            onClick={() => pageIndex > 0 && changePage(pageIndex - 1)}
          >
            <PaginationPrevious
              className={`${
                pageIndex === 0 &&
                "opacity-50 hover:bg-transparent hover:text-white !cursor-not-allowed"
              } cursor-pointer`}
            />
          </PaginationItem>
          {[...Array(data.pageCount).keys()].map((i) => (
            <PaginationItem key={i} onClick={() => changePage(i)}>
              <PaginationLink
                className={`cursor-pointer ${pageIndex === i && "text-black"}`}
                isActive={pageIndex === i}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem
            onClick={() =>
              pageIndex < data.pageCount - 1 && changePage(pageIndex + 1)
            }
          >
            <PaginationNext
              className={`${
                pageIndex >= data.pageCount - 1 &&
                "opacity-50 hover:bg-transparent hover:text-white !cursor-not-allowed"
              } cursor-pointer`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
