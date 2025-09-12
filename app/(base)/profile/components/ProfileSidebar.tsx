"use client";

import { useState } from "react";

const tabs = [
    { key: "reviews", label: "리뷰" },
    { key: "wishlists", label: "위시리스트" },
    { key: "score-history", label: "포인트 히스토리" },
    { key: "arena", label: "투기장" },
    { key: "profile", label: "계정" },
];

export default function ProfileSidebar({
    onSelect,
}: {
    onSelect: (tab: string) => void;
}) {
    const [active, setActive] = useState("reviews");

    return (
        <div
            className={[
                "w-[250px] space-y-2 rounded-xl bg-background-200 p-4",
                // 모바일
                "mx-auto w-full max-w-full",
                "grid grid-cols-2 gap-3",
                "space-y-0 p-3",
                // 데스크탑 이상일 때 원래 스타일 유지
                "md:mx-0 md:block md:w-[250px] md:max-w-none md:grid-cols-none md:gap-0 md:space-y-2 md:p-4",
            ].join(" ")}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => {
                        setActive(tab.key);
                        onSelect(tab.key);
                    }}
                    className={[
                        // 데스크탑: 좌측 정렬
                        "w-full rounded-lg px-4 py-2 text-left font-medium transition-colors",
                        // 모바일: 정중앙 정렬
                        "flex h-12 items-center justify-center px-2 py-0 text-center",
                        "md:block md:h-auto md:px-4 md:py-2 md:text-left",
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300",
                    ].join(" ")}
                >
                    <span className="whitespace-normal break-keep leading-tight">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
