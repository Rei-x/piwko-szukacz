import React from "react";
import InfiniteScroll, { Props } from "react-infinite-scroll-component";

export const MasonryGrid = (props: Props) => {
  return (
    <InfiniteScroll
      className="w-full grid grid-cols-masonry gap-x-6 auto-rows-masonry justify-evenly"
      {...props}
    />
  );
};
