"use client";

import React, { useState } from "react";
import Pager from "@/app/components/Pager";

export default function PagerTestPage() {
    const [currentPage, setCurrentPage] = useState(1);

    // 테스트용 전체 페이지 수
    const totalPages = 10;
    const pageGroupSize = 5;

    // 현재 페이지를 기준으로 표시할 페이지 목록 생성
    const startPage =
        Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);
    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <main className="min-h-screen bg-background-400 text-font-100 p-10 space-y-6">
            <h1 className="text-headline font-bold">📄 Pager 테스트 페이지</h1>

            <div className="mb-8 text-center">
                <p className="text-lg">
                    현재 페이지:{" "}
                    <span className="font-semibold">{currentPage}</span>
                </p>
            </div>

            <Pager
                currentPage={currentPage}
                pages={pages}
                endPage={totalPages}
                onPageChange={setCurrentPage}
            />
        </main>
    );
}
