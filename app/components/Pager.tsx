"use client";

import { cn } from "@/utils/tailwindUtil";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useState } from "react";

type PagerProps = {
    currentPage: number;
    pages: number[];
    endPage: number;
    onPageChange: (newPage: number) => void;
};

export default function EnhancedPager({
    currentPage,
    pages,
    endPage,
    onPageChange,
}: PagerProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const groupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endGroupPage = Math.min(startPage + groupSize - 1, endPage);

    const pageNumbersToShow = pages.slice(startPage - 1, endGroupPage);
    const hasNextPage = currentPage < endPage;
    const hasPreviousPage = currentPage > 1;
    const hasPrevGroup = startPage > 1;
    const hasNextGroup = endGroupPage < endPage;

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage) return;

        setIsAnimating(true);
        onPageChange(newPage);

        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    };

    // 모든 버튼에 동일한 크기 적용
    const baseBtn = `
        relative overflow-hidden
        w-12 h-12 flex justify-center items-center 
        rounded-xl border
        text-sm font-medium
        transition-all duration-300 ease-out
        backdrop-blur-sm
        hover:scale-105 hover:shadow-lg
        active:scale-95
        group
    `;

    const activeBtn = `
        bg-gradient-to-r from-primary-purple-200 to-primary-blue-200
        text-font-100 font-semibold border-transparent
        shadow-lg shadow-primary-purple-200/30
        hover:shadow-xl hover:shadow-primary-purple-200/40
        before:absolute before:inset-0 
        before:bg-gradient-to-r before:from-primary-purple-100 before:to-primary-blue-100
        before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
    `;

    const hoverBtn = `
        bg-background-200 border-line-100/20 text-font-200
        hover:bg-gradient-to-r hover:from-primary-purple-100/20 hover:to-primary-blue-100/20
        hover:border-primary-purple-200/50 hover:text-font-100
        hover:shadow-primary-purple-200/20
        before:absolute before:inset-0 
        before:bg-gradient-to-r before:from-primary-purple-100/10 before:to-primary-blue-100/10
        before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
    `;

    const disabledBtn = `
        opacity-40 cursor-not-allowed 
        hover:scale-100 hover:shadow-none
        bg-background-200  border-line-100/10 text-font-200/50
    `;

    return (
        <div className="w-full mx-auto ">
            <section className="flex justify-center items-center gap-3">
                {/* First Group Button */}
                <button
                    className={cn(
                        baseBtn,
                        hasPrevGroup ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasPrevGroup && handlePageChange(startPage - groupSize)
                    }
                    disabled={!hasPrevGroup}
                    title="First group"
                >
                    <ChevronsLeft className="w-5 h-5" />
                </button>

                {/* Previous Page Button */}
                <button
                    className={cn(
                        baseBtn,
                        hasPreviousPage ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasPreviousPage && handlePageChange(currentPage - 1)
                    }
                    disabled={!hasPreviousPage}
                    title="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1 mx-2">
                    {pageNumbersToShow.map((pageNumber, index) => (
                        <div
                            key={pageNumber}
                            className="relative"
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <button
                                className={cn(
                                    baseBtn,
                                    pageNumber === currentPage
                                        ? activeBtn
                                        : hoverBtn,
                                    isAnimating &&
                                        pageNumber === currentPage &&
                                        "animate-pulse"
                                )}
                                onClick={() => handlePageChange(pageNumber)}
                            >
                                <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                                    {pageNumber}
                                </span>

                                {/* Ripple effect */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-purple-200 to-primary-blue-200 opacity-0 group-active:opacity-30 transition-opacity duration-150" />
                            </button>

                            {/* Active page indicator */}
                            {pageNumber === currentPage && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-primary-purple-200 to-primary-blue-200 rounded-full animate-bounce" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Next Page Button */}
                <button
                    className={cn(
                        baseBtn,
                        hasNextPage ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasNextPage && handlePageChange(currentPage + 1)
                    }
                    disabled={!hasNextPage}
                    title="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Last Group Button */}
                <button
                    className={cn(
                        baseBtn,
                        hasNextGroup ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasNextGroup && handlePageChange(startPage + groupSize)
                    }
                    disabled={!hasNextGroup}
                    title="Last group"
                >
                    <ChevronsRight className="w-5 h-5" />
                </button>
            </section>

            {/* Page Info */}
            <div className="mt-4 text-center">
                <span className="text-sm text-font-200 bg-background-200  px-3 py-1 rounded-full border border-line-100/20">
                    Page {currentPage} of {endPage}
                </span>
            </div>
        </div>
    );
}
