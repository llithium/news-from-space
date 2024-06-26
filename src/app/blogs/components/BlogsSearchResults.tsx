"use client";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";
import { useEffect } from "react";
import formatDate from "../../utils/formatDate";
import { useInView } from "react-intersection-observer";
import { fetchArticlesAndBlogs } from "../../utils/fetchArticlesAndBlogs";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import InfiniteScrollSpinner from "../../components/InfiniteScrollSpinner";
import { useSearchParams } from "next/navigation";
import { apiURL, pageLimit } from "@/utils/variables";

export default function BlogsSearchResults() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const { data, isError, error, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["blogsSearch", search],
      queryFn: fetchArticlesAndBlogs,
      initialPageParam:
        apiURL + `/blogs/?limit=${pageLimit}&offset=0&search=${search}`,
      getNextPageParam: (lastPage) => {
        return lastPage.next;
      },
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    inView && fetchNextPage();
  }, [inView, fetchNextPage]);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 ">
        {isError && <div>{error.message}</div>}
        {data && data.pages[0].count > 0 ? (
          data.pages.map((page) => {
            return page.results.map((blog) => {
              return (
                <Card
                  key={blog.id}
                  className="flex h-32 flex-row justify-between transition-opacity hover:opacity-80 active:opacity-disabled sm:h-44 "
                >
                  <Link
                    scroll={false}
                    key={blog.id}
                    href={`/blogs/${blog.id}`}
                    className="flex h-32 w-full flex-row py-2 sm:h-full "
                  >
                    <Image
                      alt="Blog image"
                      className="z-0 ml-2 h-full w-44 flex-shrink rounded-xl object-cover sm:w-44 sm:flex-1 lg:w-56"
                      src={blog.image_url}
                    />

                    <CardBody className="flex-grow overflow-visible overflow-y-auto py-0 sm:flex-1">
                      <h2 className="pb-0 text-xs font-bold tracking-tight transition-colors first:mt-0 sm:text-xl 2xl:text-2xl">
                        {blog.title}
                      </h2>
                      <Divider />
                      <div className="mt-auto">
                        <p className="relative top-2 m-0 text-tiny italic sm:top-1 sm:text-medium">
                          {blog.news_site}
                        </p>

                        <small className="m-0 text-tiny text-default-500">
                          {formatDate(blog.published_at)}
                        </small>
                      </div>
                    </CardBody>
                  </Link>
                  {/* <SaveIcon /> */}
                </Card>
              );
            });
          })
        ) : (
          <div className="col-span-2 mt-auto flex w-full flex-row justify-center">
            <h2 className="text-3xl ">
              No results found for:{" "}
              <span className="font-bold tracking-wider">{search}</span>
            </h2>
          </div>
        )}
      </div>
      {isFetchingNextPage && <InfiniteScrollSpinner />}
      <div ref={ref}></div>
    </>
  );
}
