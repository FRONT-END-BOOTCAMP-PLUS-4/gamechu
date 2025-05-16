"use client";

import { cn } from "@/utils/tailwindUtil";
import React from "react";

type PagerProps = {
    currentPage: number;
    pages: number[];
    endPage: number;
    onPageChange: (newPage: number) => void;
};

export default function Pager({
    currentPage,
    pages,
    endPage,
    onPageChange,
}: PagerProps) {
    // styles
    const wrapperClass =
        "w-full max-w-[500px] mx-auto p-10 flex justify-center items-center";
    const pagerClass = "flex justify-center items-center gap-2";
    const listClass = "flex justify-center items-center gap-2";

    // page buttons (1, 2, 3 ...)
    const pageButtonClass =
        "w-10 h-10 flex justify-center items-center rounded-md border border-line-100 text-font-100 transition-colors";
    const pageButtonActiveClass = "bg-primary-purple-200 font-semibold";
    const pageButtonHoverClass = "hover:border-font-100 hover:text-font-100";

    // left, right move buttons (< >)
    const pageMoverClass =
        "w-10 h-10 flex justify-center items-center rounded-md border border-line-100 text-font-100 transition-colors font-semibold";
    const pageMoverHoverClass = "hover:border-font-100 hover:text-font-100";
    const pageMoverDisabledClass = "opacity-50 cursor-not-allowed";

    // page variables
    const hasNextPage = currentPage + 1 <= endPage;
    const hasPreviousPage = currentPage > 1;

    return (
        <div className={wrapperClass}>
            <section className={pagerClass}>
                <button
                    className={cn(
                        pageMoverClass,
                        hasPreviousPage
                            ? pageMoverHoverClass
                            : pageMoverDisabledClass
                    )}
                    onClick={() => {
                        if (hasPreviousPage)
                            onPageChange(Math.max(currentPage - 1, 1));
                    }}
                >
                    &lt;
                </button>
                <ul className={listClass}>
                    {pages.map((pageNumber) => (
                        <li key={pageNumber}>
                            <button
                                className={`${pageButtonClass} ${
                                    pageNumber === currentPage
                                        ? pageButtonActiveClass
                                        : pageButtonHoverClass
                                }`}
                                onClick={() => onPageChange(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    className={cn(
                        pageMoverClass,
                        hasNextPage
                            ? pageMoverHoverClass
                            : pageMoverDisabledClass
                    )}
                    onClick={() => {
                        if (hasNextPage)
                            onPageChange(Math.min(currentPage + 1, endPage));
                    }}
                >
                    &gt;
                </button>
            </section>
        </div>
    );
}
