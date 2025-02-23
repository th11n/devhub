"use client";

import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import PostCard from "./postCard";
import { Post } from "@/types/post";
import { useCallback, useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "./spinner";

export default function PostGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("filterBy")

  const [pageIndex, setPageIndex] = useState(0);
  const { data, error, isLoading } = useSWR(
    `/api/posts?page=${pageIndex}${category ? `&filterBy=${category}` : ''}`,
    fetcher
  );

  useEffect(() => {
    const pageNumber = searchParams.get("page");
    setPageIndex(pageNumber && !isNaN(Number(pageNumber)) ? Number(pageNumber) - 1 : 0);
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full min-h-[69vh]"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500">{error.info.message}</div>;
  }

  if (pageIndex > data.pageCount - 1 || pageIndex < 0) {
    return (
      <Link className="text-white" href="/">Back to home</Link>
    )
  }

  const changePage = (page: number) => {
    createQueryString("page", (page + 1).toString());
    setPageIndex(page)
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-between">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-[10]">
        {data.data.map((data: Post) => {
          return (
            <PostCard
              key={data.id}
              title={data.title}
              desc={data.body}
              image={data.image}
              url={data.url}
              category={data.category}
            />
          );
        })}
      </div>
      <Pagination className="text-white mt-12 mb-6">
        <PaginationContent>
          <PaginationItem onClick={() => {
            if (pageIndex === 0) {
              return
            }

            changePage(pageIndex - 1)
          }}>
            <PaginationPrevious className={`${pageIndex === 0 && 'opacity-50 hover:bg-transparent hover:text-white !cursor-not-allowed'} cursor-pointer`} />
          </PaginationItem>
          {[...Array(data.pageCount).keys()].map((i) => {
            return (
              <PaginationItem key={i} onClick={() => changePage(i)}>
                <PaginationLink className={`cursor-pointer ${pageIndex === i && "text-black"}`} isActive={pageIndex === i}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem onClick={() => {
            if (pageIndex >= data.pageCount - 1) {
              return
            }
            changePage(pageIndex + 1)
          }}>
            <PaginationNext className={`${pageIndex >= data.pageCount - 1 && 'opacity-50 hover:bg-transparent hover:text-white !cursor-not-allowed'} cursor-pointer`} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
