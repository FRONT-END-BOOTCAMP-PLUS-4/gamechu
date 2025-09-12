"use client";

import { useState } from "react";
import MyWaitingArenaList from "../MyWaitingArenaList";
import MyDebatingArenaList from "../MyDebatingArenaList";
import MyCompletedArenaList from "../MyCompletedArenaList";
import MyRecruitingArenaList from "../MyRecrutingArenaList";
import MyVotingArenaList from "../MyVotingArenaList";

const TABS = [
    { key: "recruiting", label: "모집 중" },
    { key: "waiting", label: "대기 중" },
    { key: "debating", label: "토론 중" },
    { key: "voting", label: "투표 중" },
    { key: "completed", label: "종료됨" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProfileArenaTab() {
    const [activeTab, setActiveTab] = useState<TabKey>("debating");

    const renderContent = () => {
        switch (activeTab) {
            case "recruiting":
                return <MyRecruitingArenaList />;
            case "waiting":
                return <MyWaitingArenaList />;
            case "debating":
                return <MyDebatingArenaList />;
            case "voting":
                return <MyVotingArenaList />;
            case "completed":
                return <MyCompletedArenaList />;
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="text-body text-lg font-semibold">투기장</h2>

            {/* 탭 메뉴 */}
            <div className="no-scrollbar relative overflow-x-auto">
                <div className="flex min-w-max justify-center gap-2 whitespace-nowrap border-b border-gray-600 px-4 pb-2 sm:gap-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                                activeTab === tab.key
                                    ? "border-purple-500 text-purple-500"
                                    : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 탭 내용 */}
            <div>{renderContent()}</div>
        </div>
    );
}
