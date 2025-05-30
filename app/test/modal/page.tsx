"use client";

import React from "react";
import useModalStore from "@/stores/modalStore";
import Modals from "@/app/components/Modals";

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

    return (
        <main className="min-h-screen bg-background-400 text-font-100 p-10 space-y-6">
            <h1 className="text-headline font-bold">Modal 테스트 페이지</h1>

            <button
                className="font-semibold"
                onClick={() =>
                    useModalStore.getState().openModal("notification", null)
                }
            >
                NotificationModal
            </button>

            <Modals />
        </main>
    );
}
