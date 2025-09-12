"use client";

import { cn } from "@/utils/tailwindUtil";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";

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
    const [isAnimating, setIsAnimating] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10); // 한 번에 보여줄 버튼 수

    /** 화면 크기에 따라 페이지 버튼 개수 조절 */
    useEffect(() => {
        const updateVisibleCount = () => {
            const width = window.innerWidth;
            if (width < 1024)
                setVisibleCount(5); // 작은 데스크탑: 5개
            else if (width < 1280)
                setVisibleCount(7); // 중간: 7개
            else setVisibleCount(10); // 큰 화면: 10개
        };
        updateVisibleCount();
        window.addEventListener("resize", updateVisibleCount);
        return () => window.removeEventListener("resize", updateVisibleCount);
    }, []);

    const currentGroup = Math.floor((currentPage - 1) / visibleCount);
    const startPage = currentGroup * visibleCount + 1;
    const endGroupPage = Math.min(startPage + visibleCount - 1, endPage);

    const pageNumbersToShow = pages.slice(startPage - 1, endGroupPage);

    const hasNextPage = currentPage < endPage;
    const hasPreviousPage = currentPage > 1;
    const hasPrevGroup = startPage > 1;
    const hasNextGroup = endGroupPage < endPage;

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage) return;
        setIsAnimating(true);
        onPageChange(newPage);
        setTimeout(() => setIsAnimating(false), 300);
    };

    /** 반응형 버튼 크기: 화면이 줄어들수록 작아짐 */
    const baseBtn = `
        relative overflow-hidden
        w-[clamp(2.2rem,4vw,3rem)] h-[clamp(2.2rem,4vw,3rem)]
        rounded-xl
        flex justify-center items-center 
        border
        text-[clamp(0.7rem,1.5vw,0.875rem)] font-medium
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
        bg-background-200 border-line-100/10 text-font-200/50
    `;

    return (
        <div className="mx-auto w-full">
            {/* ✅ 모바일 (md 미만) */}
            <section className="flex items-center justify-center gap-3 md:hidden">
                <button
                    className={cn(
                        baseBtn,
                        hasPreviousPage ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasPreviousPage && handlePageChange(currentPage - 1)
                    }
                    disabled={!hasPreviousPage}
                >
                    <ChevronLeft className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                </button>

                <span className="min-w-[90px] rounded-full border border-line-100/20 bg-background-200 px-3 py-2 text-center text-sm text-font-200">
                    {currentPage} / {endPage}
                </span>

                <button
                    className={cn(
                        baseBtn,
                        hasNextPage ? hoverBtn : disabledBtn
                    )}
                    onClick={() =>
                        hasNextPage && handlePageChange(currentPage + 1)
                    }
                    disabled={!hasNextPage}
                >
                    <ChevronRight className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                </button>
            </section>

            {/* ✅ 데스크탑 (md 이상) */}
            <div className="hidden md:block">
                <section className="flex items-center justify-center gap-[clamp(0.25rem,0.8vw,0.5rem)]">
                    {/* First Group */}
                    <button
                        className={cn(
                            baseBtn,
                            hasPrevGroup ? hoverBtn : disabledBtn
                        )}
                        onClick={() =>
                            hasPrevGroup &&
                            handlePageChange(startPage - visibleCount)
                        }
                        disabled={!hasPrevGroup}
                    >
                        <ChevronsLeft className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                    </button>

                    {/* Previous Page */}
                    <button
                        className={cn(
                            baseBtn,
                            hasPreviousPage ? hoverBtn : disabledBtn
                        )}
                        onClick={() =>
                            hasPreviousPage && handlePageChange(currentPage - 1)
                        }
                        disabled={!hasPreviousPage}
                    >
                        <ChevronLeft className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                    </button>

                    {/* Page Numbers */}
                    <div className="mx-2 flex gap-[clamp(0.2rem,0.5vw,0.4rem)]">
                        {pageNumbersToShow.map((pageNumber) => (
                            <button
                                key={pageNumber}
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
                                <span className="relative z-10">
                                    {pageNumber}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Next Page */}
                    <button
                        className={cn(
                            baseBtn,
                            hasNextPage ? hoverBtn : disabledBtn
                        )}
                        onClick={() =>
                            hasNextPage && handlePageChange(currentPage + 1)
                        }
                        disabled={!hasNextPage}
                    >
                        <ChevronRight className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                    </button>

                    {/* Last Group */}
                    <button
                        className={cn(
                            baseBtn,
                            hasNextGroup ? hoverBtn : disabledBtn
                        )}
                        onClick={() =>
                            hasNextGroup &&
                            handlePageChange(startPage + visibleCount)
                        }
                        disabled={!hasNextGroup}
                    >
                        <ChevronsRight className="h-[clamp(1rem,3vw,1.25rem)] w-[clamp(1rem,3vw,1.25rem)]" />
                    </button>
                </section>

                {/* Page Info */}
                <div className="mt-4 text-center">
                    <span className="rounded-full border border-line-100/20 bg-background-200 px-3 py-1 text-sm text-font-200">
                        Page {currentPage} of {endPage}
                    </span>
                </div>
            </div>
        </div>
    );
}
