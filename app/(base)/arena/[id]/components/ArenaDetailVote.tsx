"use client";

import Button from "@/app/components/Button";
import VoteStatusBar from "../../components/VoteStatusBar";
import useArenaStore from "@/stores/useArenaStore";
import { useEffect, useState } from "react";

interface ArenaVoteProps {
    leftVotes: number;
    rightVotes: number;
}

export default function ArenaDetailVote({
    leftVotes,
    rightVotes,
}: ArenaVoteProps) {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const [remainingTime, setRemainingTime] = useState<string>("");

    // 투표 합계
    const totalVotes = leftVotes + rightVotes;

    // 퍼센트 계산 (투표가 없으면 0으로 처리)
    const leftPercent = totalVotes ? (leftVotes / totalVotes) * 100 : 0;
    const rightPercent = totalVotes ? (rightVotes / totalVotes) * 100 : 0;

    // 남은 시간 계산 함수
    const calculateRemainingTime = () => {
        if (!arenaDetail?.endVote) return "";

        const now = new Date();
        const end = new Date(arenaDetail.endVote);
        const diffMs = end.getTime() - now.getTime();

        if (diffMs <= 0) return "0h 0m";

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return `${diffHours}h ${diffMinutes}m`;
    };

    // 남은 시간 실시간 업데이트 (1분마다)
    useEffect(() => {
        setRemainingTime(calculateRemainingTime());

        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime());
        }, 60 * 1000); // 1분마다 업데이트

        return () => clearInterval(interval);
    }, [arenaDetail?.endVote]);

    // 투표 상태가 아닌 경우 렌더링 안 함
    if (arenaDetail?.status !== 4 && arenaDetail?.status !== 5) return null;

    return (
        <div className="w-full max-w-[1000px] mt-6 bg-background-300 rounded-xl px-6 py-4 flex flex-col items-center justify-center gap-4 min-h-[200px] animate-fade-in-up">
            {/* 상단 투표 영역 */}
            <div className="w-full flex items-center justify-between">
                {/* A 유저 */}
                <div className="flex items-center gap-2 text-center">
                    {arenaDetail?.status === 4 ? (
                        <Button label="투표" type="purple" />
                    ) : (
                        <div className="w-24 text-font-100 font-bold">
                            {Math.round(leftPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        <img
                            src="/icons/teamA.svg"
                            alt="게시자 아이콘"
                            className="w-10 h-10"
                        />
                        {arenaDetail?.creatorName}(티어)
                    </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-background-200 flex items-center justify-center text-white font-bold">
                    VS
                </div>

                {/* B 유저 */}
                <div className="flex items-center gap-2 flex-row-reverse">
                    {arenaDetail?.status === 4 ? (
                        <Button label="투표" type="blue" />
                    ) : (
                        <div className="w-24 text-font-100 font-bold text-center">
                            {Math.round(rightPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        {arenaDetail?.challengerName}(티어)
                        <img
                            src="/icons/teamB.svg"
                            alt="게시자 아이콘"
                            className="w-10 h-10"
                        />
                    </div>
                </div>
            </div>

            {/* 게이지 바 (투표 종료 시만 보임) */}
            {arenaDetail?.status === 5 && (
                <VoteStatusBar leftPercent={leftPercent} />
            )}

            {/* 하단 상태 메시지 */}
            <div className="text-font-100 text-caption">
                {arenaDetail?.status === 4 ? (
                    <>
                        투표가 진행중입니다. 남은시간 :{" "}
                        <span className="font-bold">{remainingTime}</span>
                    </>
                ) : (
                    <>투표가 종료되었습니다.</>
                )}
            </div>
        </div>
    );
}
