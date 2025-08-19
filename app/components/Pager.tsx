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
    pages: number[]; // [1..endPage]
    endPage: number;
    onPageChange: (newPage: number) => void;
};

/** 간단한 반응형 훅: 모바일(≤640px) 여부 */
function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    useEffect(() => {
        const m = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const onChange = () => setIsMobile(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, [breakpoint]);
    return isMobile;
}

export default function Pager({
    currentPage,
    pages,
    endPage,
    onPageChange,
}: PagerProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const isMobile = useIsMobile(); // true면 모바일 뷰

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
        onPageChange(newPage); // 부모가 여기서 "그 페이지 하나"만 fetch
        setTimeout(() => setIsAnimating(false), 300);
    };

    // ✅ 데스크탑과 동일한 버튼 디자인(크기/모양) 고정
    const baseBtn = `
    relative overflow-hidden
    w-12 h-12 rounded-xl
    flex justify-center items-center 
    border
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
    bg-background-200 border-line-100/10 text-font-200/50
  `;

    return (
        <div className="mx-auto w-full">
            {/* 모바일: 이전 | 현재/전체 | 다음 (버튼 디자인은 데탑과 동일) */}
            {isMobile ? (
                <>
                    <section className="flex items-center justify-center gap-3">
                        <button
                            className={cn(
                                baseBtn,
                                hasPreviousPage ? hoverBtn : disabledBtn
                            )}
                            onClick={() =>
                                hasPreviousPage &&
                                handlePageChange(currentPage - 1)
                            }
                            disabled={!hasPreviousPage}
                            title="이전 페이지"
                            aria-label="이전 페이지"
                        >
                            <ChevronLeft className="h-5 w-5" />
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
                            title="다음 페이지"
                            aria-label="다음 페이지"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </section>
                </>
            ) : (
                // 데스크탑/태블릿: 그룹 이동 + 숫자 버튼 (디자인 동일)
                <>
                    <section className="flex items-center justify-center gap-3">
                        {/* First Group */}
                        <button
                            className={cn(
                                baseBtn,
                                hasPrevGroup ? hoverBtn : disabledBtn
                            )}
                            onClick={() =>
                                hasPrevGroup &&
                                handlePageChange(startPage - groupSize)
                            }
                            disabled={!hasPrevGroup}
                            title="이전 10페이지"
                            aria-label="이전 10페이지"
                        >
                            <ChevronsLeft className="h-5 w-5" />
                        </button>

                        {/* Previous Page */}
                        <button
                            className={cn(
                                baseBtn,
                                hasPreviousPage ? hoverBtn : disabledBtn
                            )}
                            onClick={() =>
                                hasPreviousPage &&
                                handlePageChange(currentPage - 1)
                            }
                            disabled={!hasPreviousPage}
                            title="이전 페이지"
                            aria-label="이전 페이지"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="mx-2 flex gap-1">
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
                                        onClick={() =>
                                            handlePageChange(pageNumber)
                                        }
                                        aria-current={
                                            pageNumber === currentPage
                                                ? "page"
                                                : undefined
                                        }
                                        aria-label={`${pageNumber} 페이지`}
                                    >
                                        <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                                            {pageNumber}
                                        </span>

                                        {/* Ripple */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-purple-200 to-primary-blue-200 opacity-0 transition-opacity duration-150 group-active:opacity-30" />
                                    </button>
                                </div>
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
                            title="다음 페이지"
                            aria-label="다음 페이지"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Last Group */}
                        <button
                            className={cn(
                                baseBtn,
                                hasNextGroup ? hoverBtn : disabledBtn
                            )}
                            onClick={() =>
                                hasNextGroup &&
                                handlePageChange(startPage + groupSize)
                            }
                            disabled={!hasNextGroup}
                            title="다음 10페이지"
                            aria-label="다음 10페이지"
                        >
                            <ChevronsRight className="h-5 w-5" />
                        </button>
                    </section>

                    {/* Page Info */}
                    <div className="mt-4 text-center">
                        <span className="rounded-full border border-line-100/20 bg-background-200 px-3 py-1 text-sm text-font-200">
                            Page {currentPage} of {endPage}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
