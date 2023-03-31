import { defaultOptions } from "@/hooks/useBeers";
import { BeerCard } from "@/components/BeerCard";
import { Layout } from "@/components/Layout";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { fetchBeer } from "@/api/fetchBeer";
import { Button, Divider, Pagination } from "react-daisyui";
import { atomWithHash } from "jotai-location";
import { Router } from "next/router";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { GetStaticPropsContext } from "next";
import { Link } from "@/components/Link";

const pageAtom = atomWithHash("page", 1, {
  subscribe: (callback) => {
    Router.events.on("routeChangeComplete", callback);
    window.addEventListener("hashchange", callback);
    return () => {
      Router.events.off("routeChangeComplete", callback);
      window.removeEventListener("hashchange", callback);
    };
  },
});

const options = (pageParam: number, perPage: number) => ({
  queryKey: ["beers", pageParam, perPage],
  queryFn: () =>
    fetchBeer({
      page: pageParam,
      perPage,
    }),
});

const useBeersPaginate = ({ pageParam = 1, perPage = 10 }) => {
  return useQuery(options(pageParam, perPage));
};

const Skeleton = () => (
  <div
    role="status"
    className="space-y-8 my-4 animate-pulse shadow-lg p-3 md:flex flex-col items-center"
    style={{ height: 400 }}
  >
    <div className="w-full">
      <div className="h-4 bg-gray-200 rounded-full  w-10"></div>
      <div className="flex items-center mx-auto justify-center w-1/4 h-48 bg-gray-300 rounded"></div>
    </div>
    <Divider className="h-0" />
    <div className="w-full">
      <div className="h-2.5 bg-gray-200 rounded-full  w-1/2 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full w-full mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full  mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full  w-full mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full  w-full mb-2.5"></div>
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

const PagesButtons = ({
  page,
  setPage,
  isLastPage,
  className,
}: {
  page: number;
  setPage: (page: number) => void;
  isLastPage?: boolean;
  className?: string;
}) => {
  return (
    <Pagination className={`flex justify-center ${className}`}>
      <Button
        color="primary"
        disabled={page === 1}
        onClick={() => {
          setPage(page - 1);
          window.scrollTo({ top: 0 });
        }}
      >
        «
      </Button>
      <Button color="primary">Page {page}</Button>
      <Button
        color="primary"
        disabled={isLastPage}
        onClick={() => {
          setPage(page + 1);
          window.scrollTo({ top: 0 });
        }}
      >
        »
      </Button>
    </Pagination>
  );
};

export default function Home() {
  const [page, setPage] = useAtom(pageAtom);
  const perPage = 32;
  const beers = useBeersPaginate({
    pageParam: page,
    perPage,
  });

  const [showSkeleton, setShowSkeleton] = useState(false);

  const isLastPage =
    (beers.data?.beers.length ?? 0) < perPage && !beers.isFetching;

  return (
    <Layout>
      <div className="flex mt-4 justify-between mx-4">
        <div />
        <PagesButtons
          className="ml-12"
          page={page}
          setPage={setPage}
          isLastPage={isLastPage}
        />
        <Link href="/wall" className="block mt-4">
          Disable pagination
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
        <AnimatePresence mode="popLayout">
          {beers.data?.beers.map((beer, i) => (
            <motion.div
              key={beer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.4,
              }}
            >
              <BeerCard height={400} beer={beer} />
            </motion.div>
          ))}
          {!beers.data || beers.data.beers.length === 0
            ? Array.from({ length: perPage }).map((_, i) => (
                <motion.div
                  key={i + "placeholder"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.4,
                  }}
                >
                  <Skeleton />
                </motion.div>
              ))
            : null}
        </AnimatePresence>
      </div>
      <PagesButtons
        className="mb-10"
        page={page}
        setPage={setPage}
        isLastPage={isLastPage}
      />
    </Layout>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const queryClient = new QueryClient();
  console.log(context);

  // await queryClient.prefetchQuery(options())

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
}
