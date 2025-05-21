"use client";

import React, { useState, useEffect } from "react";
import NotificationModal from "@/app/(base)/components/NotificationModal";
import Pager from "@/app/components/Pager";

export default function PagerTestPage() {
    const [currentPage, setCurrentPage] = useState(1);

    // useEffect(() => {
    //     const fetchNotificationRecords = async () => {
    //         try {
    //             const res = await fetch("/api/member/notifications", {
    //                 method: "GET",
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             const data = await res.json();
    //             if (Array.isArray(data.categories)) {
    //                 setCategories(data.categories);
    //             }
    //         } catch (error) {
    //             console.error("카테고리 불러오기 실패:", error);
    //         }
    //     };
    //     fetchNotificationRecords();
    // }, []);

    // 테스트용 알림 기록
    const testDto = {
        records: [{}, {}],
        currentPage: 1,
        pages: [1, 2],
        endPage: 2,
    };

    return (
        <main className="min-h-screen bg-background-400 text-font-100 p-10 space-y-6">
            <h1 className="text-headline font-bold">
                NotificationModal 테스트 페이지
            </h1>

            <NotificationModal notificationRecordListDto={testDto} />

            <Pager
                currentPage={testDto.currentPage}
                pages={testDto.pages}
                endPage={testDto.endPage}
                onPageChange={setCurrentPage}
            />
        </main>
    );
}
