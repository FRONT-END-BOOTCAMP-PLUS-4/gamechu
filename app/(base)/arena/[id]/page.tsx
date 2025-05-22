"use client";

import ArenaVote from "./components/ArenaDetailVote";
import ArenaChatting from "./components/ArenaDetailContainer";
import ArenaHeader from "./components/ArenaDetailHeader";
import React, { useEffect, useState } from "react";
import ArenaInfo from "./components/ArenaDetailInfo";
import { useParams } from "next/navigation";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

export default function ArenaDetailPage() {
    const [arenaData, setArenaData] = useState<ArenaDetailDto>();
    const idParams = useParams().id;
    const arenaId = Number(idParams);
    // 투표 수
    const leftVotes = 192;
    const rightVotes = 85;

    useEffect(() => {
        const fetchArenaDetail = async () => {
            try {
                const res = await fetch(`/api/arenas/${arenaId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch arena detail");
                }

                const data: ArenaDetailDto = await res.json();
                setArenaData(data);
            } catch (error) {
                console.error("Error fetching arena detail:", error);
            }
        };

        fetchArenaDetail();
    }, [arenaId]);
    return (
        <div>
            {/* <div className="flex gap-4">
                <button onClick={() => setStatus("recruiting")}>모집중</button>
                <button onClick={() => setStatus("waiting")}>대기중</button>
                <button onClick={() => setStatus("active")}>진행중</button>
                <button onClick={() => setStatus("voting")}>투표중</button>
                <button onClick={() => setStatus("closed")}>종료</button>
            </div> */}
            <div className="flex px-16 py-16 gap-8">
                {/* 왼쪽: 채팅, 투표 등 */}
                <div className="flex flex-col flex-[3]">
                    <ArenaHeader arenaData={arenaData} />
                    <ArenaChatting arenaData={arenaData} />
                    <ArenaVote leftVotes={leftVotes} rightVotes={rightVotes} />
                </div>

                {/* 오른쪽: 정보 패널 */}
                <div className="flex-[1] mt-16">
                    <ArenaInfo arenaData={arenaData} />
                </div>
            </div>
        </div>
    );
}
