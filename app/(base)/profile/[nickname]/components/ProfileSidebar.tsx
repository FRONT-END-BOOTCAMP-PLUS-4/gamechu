"use client";

import { useState } from "react";

const tabs = [
    { key: "reviews", label: "리뷰" },
    { key: "arena", label: "투기장" },
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
                "rounded-xl bg-background-200",
                // 모바일
                "mx-auto w-full max-w-full p-3",
                "grid auto-rows-fr grid-cols-2 gap-3",
                // 데스크탑
                "md:mx-0 md:block md:w-[250px] md:space-y-2 md:p-4",
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
                        // 모바일
                        "flex h-12 w-full items-center justify-center rounded-lg p-0 font-medium transition-colors",
                        // 데스크탑
                        "md:block md:h-auto md:px-4 md:py-2 md:text-left",
                        active === tab.key
                            ? "bg-primary-purple-200 text-white"
                            : "text-font-100 hover:bg-background-300",
                    ].join(" ")}
                >
                    <span className="whitespace-nowrap leading-tight">
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
