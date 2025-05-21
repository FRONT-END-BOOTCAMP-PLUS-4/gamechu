"use client";

import React, { useState, useEffect } from "react";
import useModalStore from "@/stores/modalStore";
import Modals from "@/app/components/Modals";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";

export default function PagerTestPage() {
    // const [currentPage, setCurrentPage] = useState(1);

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
    const testDto: NotificationRecordListDto = {
        records: [
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 1,
                description: "골드 IV 단계로 승급하셨습니다",
                createdAt: new Date(),

                typeName: "티어 승급",
                typeImageUrl: "/icons/promotion.svg",
            },
            {
                id: 2,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 2,
                description: "골드 V 단계로 강등되셨습니다",
                createdAt: new Date(),

                typeName: "티어 강등",
                typeImageUrl: "/icons/relegation.svg",
            },
            {
                id: 3,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 3,
                description: "토론에 도전자가 참여하였습니다.",
                createdAt: new Date(),

                typeName: "도전자 참여 완료",
                typeImageUrl: "/icons/recruitComplete.svg",
            },
            {
                id: 4,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 4,
                description: "토론이 시작되었습니다.",
                createdAt: new Date(),

                typeName: "토론 시작",
                typeImageUrl: "/icons/debateStart.svg",
            },
            {
                id: 5,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 5,
                description: "투표가 종료되었습니다. 결과를 확인해보세요!",
                createdAt: new Date(),

                typeName: "투표 종료",
                typeImageUrl: "/icons/voteComplete.svg",
            },
        ],
        currentPage: 1,
        pages: [1],
        endPage: 1,
    };

    return (
        <main className="min-h-screen bg-background-400 text-font-100 p-10 space-y-6">
            <h1 className="text-headline font-bold">Modal 테스트 페이지</h1>

            <h2
                className="font-semibold"
                onClick={() =>
                    useModalStore.getState().openModal("notification", null, {
                        notificationRecordListDto: testDto,
                    })
                }
            >
                NotificationModal
            </h2>

            <Modals />
        </main>
    );
}
