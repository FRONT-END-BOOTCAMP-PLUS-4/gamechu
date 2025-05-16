"use client";

import ArenaVote from "../components/AnrenaVote";
import ArenaChatting from "../components/ArenaChatting";
import ArenaHeader from "../components/ArenaHeader";
import React, { useState } from "react";
import ArenaInfo from "../components/ArenaInfo";

export default function ArenaDetailPage() {
    const [status, setStatus] = useState<
        "recruiting" | "waiting" | "active" | "voting" | "closed"
    >("recruiting");
    const startAt = "25.05.14 20:00";

    // 투표 수
    const leftVotes = 192;
    const rightVotes = 85;

    return (
        <div>
            <div className="flex gap-4">
                <button onClick={() => setStatus("recruiting")}>모집중</button>
                <button onClick={() => setStatus("waiting")}>대기중</button>
                <button onClick={() => setStatus("active")}>진행중</button>
                <button onClick={() => setStatus("voting")}>투표중</button>
                <button onClick={() => setStatus("closed")}>종료</button>
            </div>
            <div className="flex px-16 py-16 gap-8">
                {/* 왼쪽: 채팅, 투표 등 */}
                <div className="flex flex-col flex-[3]">
                    <ArenaHeader />
                    <ArenaChatting status={status} startAt={startAt} />
                    <ArenaVote
                        status={status}
                        leftVotes={leftVotes}
                        rightVotes={rightVotes}
                    />
                </div>

                {/* 오른쪽: 정보 패널 */}
                <div className="flex-[1] mt-16">
                    <ArenaInfo />
                </div>
            </div>
        </div>
    );
}
