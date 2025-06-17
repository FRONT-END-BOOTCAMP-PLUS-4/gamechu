"use client";

import Button from "@/app/components/Button";
import VoteStatusBar from "../../components/VoteStatusBar";
import useArenaStore from "@/stores/useArenaStore";
import { useCallback, useEffect, useState } from "react";
import { useSubmitVote } from "@/hooks/useSubmitVote";
import { useGetVote } from "@/hooks/useGetVote";
import Image from "next/image";
import TierBadge from "@/app/components/TierBadge";

export default function ArenaDetailVote() {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    const { voteData, refetch: refetchVoteData } = useGetVote(
        arenaDetail?.id || 0
    );

    // 투표 버튼은 항상 활성화 상태, 단 내가 투표한 쪽에는 "내가 투표한 항목" 표시
    const isVotedToLeft = voteData?.votedTo === arenaDetail?.creatorId;
    const isVotedToRight = voteData?.votedTo === arenaDetail?.challengerId;

    const [remainingTime, setRemainingTime] = useState<string>("");
    const { submitVote, loading, error } = useSubmitVote();

    const leftVotes = voteData?.leftVotes || 0;
    const rightVotes = voteData?.rightVotes || 0;
    const totalVotes = leftVotes + rightVotes;

    const leftPercent = totalVotes ? (leftVotes / totalVotes) * 100 : 0;
    const rightPercent = totalVotes ? (rightVotes / totalVotes) * 100 : 0;

    const calculateRemainingTime = useCallback(() => {
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
    }, [arenaDetail?.endVote]);

    useEffect(() => {
        setRemainingTime(calculateRemainingTime());

        const interval = setInterval(() => {
            setRemainingTime(calculateRemainingTime());
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [calculateRemainingTime]);

    if (arenaDetail?.status !== 4 && arenaDetail?.status !== 5) return null;

    const handleVote = async (votedTo: string | null) => {
        if (!arenaDetail?.id || !votedTo) return;
        await submitVote(arenaDetail.id, votedTo);
        refetchVoteData();
    };

    return (
        <div className="w-full max-w-[1000px] mt-6 bg-background-300 rounded-xl px-6 py-4 flex flex-col items-center justify-center gap-4 min-h-[200px] animate-fade-in-up">
            {/* 상단 투표 영역 */}
            <div className="w-full flex items-center justify-between">
                {/* A 유저 */}
                <div className="flex items-center gap-2 text-center">
                    {arenaDetail?.status === 4 ? (
                        <Button
                            label={isVotedToLeft ? "✔" : "투표"}
                            type="purple"
                            onClick={() => handleVote(arenaDetail.creatorId)}
                            disabled={loading}
                        />
                    ) : (
                        <div className="w-24 text-font-100 font-bold">
                            {Math.round(leftPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        <Image
                            src="/icons/teamA.svg"
                            alt="게시자 아이콘"
                            width={40}
                            height={40}
                        />
                        {arenaDetail?.creatorName}
                        <TierBadge
                            score={arenaDetail.creatorScore || 0}
                            size="sm"
                        />
                    </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-background-200 flex items-center justify-center text-white font-bold">
                    VS
                </div>

                {/* B 유저 */}
                <div className="flex items-center gap-2 flex-row-reverse">
                    {arenaDetail?.status === 4 ? (
                        <Button
                            label={isVotedToRight ? "✔" : "투표"}
                            type="blue"
                            onClick={() => handleVote(arenaDetail.challengerId)}
                            disabled={loading}
                        />
                    ) : (
                        <div className="w-24 text-font-100 font-bold text-center">
                            {Math.round(rightPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        <TierBadge
                            score={arenaDetail.challengerScore || 0}
                            size="sm"
                        />
                        {arenaDetail?.challengerName}
                        <Image
                            src="/icons/teamB.svg"
                            alt="게시자 아이콘"
                            width={40}
                            height={40}
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

            {/* 에러 메시지 */}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
    );
}
