// ProductList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Switch from "@mui/material/Switch";
import ProductCard from "./ProductCard.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { fetchProductList } from "./api.js";
import { useDebounce } from "use-debounce";
import Loading from "./components/Loading.jsx";

const ProductList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [isFreeDeliveryEnabled, setIsFreeDeliveryEnabled] = useState(false);
  const [isBestSellerEnabled, setIsBestSellerEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 500);
  const { ref, inView } = useInView();

  const handleQuery = (event) => {
    setSearchQuery(event.target.value);
  };

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    isSuccess,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["key",isBestSellerEnabled,isFreeDeliveryEnabled,debouncedValue,searchQuery],
    queryFn: ({ pageParam }) =>
      fetchProductList({pageParam,isBestSellerEnabled,isFreeDeliveryEnabled,searchQuery,}),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? false,
  });

  const content =
    isSuccess &&
    data.pages.map((page, j) =>
      page.products.map((product, i) => {
        if (data.pages.length * page.products.length === (i + 1) * (1 + j)) {
          return <ProductCard ref={ref} product={product} key={product.id} />;
        }
        return <ProductCard product={product} key={product.id} />;
      })
    );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="flex flex-col p-2 items-center w-full">
      <div className="flex flex-row gap-2 sticky top-0 bg-white py-2 bg-gray-50 w-full items-center justify-center">
        <div className="flex gap-2 border items-center w-[10rem]">
          <Switch
            {...label}
            onChange={() => {
              return setIsFreeDeliveryEnabled(!isFreeDeliveryEnabled);
            }}
          />
          ارسال رایگان
        </div>
        <div className="flex  gap-2 border items-center w-[10rem]">
          <Switch
            {...label}
            onChange={() => {
              return setIsBestSellerEnabled(!isBestSellerEnabled);
            }}
          />
          غرفه برتر
        </div>
        <input
          placeholder="دنبال چی هستی؟"
          className="border p-1 text-center"
          type="text"
          // value={debouncedValue}
          onChange={handleQuery}
        ></input>
        <Link to="/basket" className="btn">
          بریم سبد خرید
        </Link>
      </div>

      {content}
      {isFetchingNextPage && <Loading />}
      {isLoading && <Loading />}
      {error && <div className="text-red-500 my-20">{error.message}</div>}
    </div>
  );
};

export default ProductList;
