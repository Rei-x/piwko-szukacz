import { fetchBeer } from "@/api/fetchBeer";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";

export const beersQueryKey = () => ["beers"];

export const defaultOptions = {
  queryKey: beersQueryKey(),
  queryFn: (data) => {
    return fetchBeer({
      page: data.pageParam,
    });
  },
  getNextPageParam: (lastPage) => {
    return (lastPage as { beers: []; nextPage: null | number }).nextPage ?? 1;
  },
} satisfies UseInfiniteQueryOptions;

export const useBeers = (options?: typeof defaultOptions) => {
  return useInfiniteQuery({ ...defaultOptions, ...options });
};
