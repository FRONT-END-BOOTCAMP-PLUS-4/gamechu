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
                // 기본(>820px): 좌측 세로 리스트
                "w-[250px] space-y-2 rounded-xl bg-background-200 p-4",
                // ≤820px: 가운데 배치 + 2열 그리드
                "max-[820px]:mx-auto max-[820px]:w-full max-[820px]:max-w-[520px]",
                "max-[820px]:grid max-[820px]:grid-cols-2 max-[820px]:gap-3",
                "max-[820px]:space-y-0",
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
                        "w-full rounded-lg px-4 py-2 text-left font-medium transition-colors",
                        // ≤820px: 중앙 정렬 + 균일 높이
                        "max-[820px]:h-12 max-[820px]:text-center",
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300",
                    ].join(" ")}
                >
                    <span className="whitespace-normal break-keep">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
