"use client";

import Button from "@/app/components/Button";
import VoteStatusBar from "../../components/VoteStatusBar";
import useArenaStore from "@/stores/useArenaStore";
import { useCallback, useEffect, useState } from "react";
import { useVote } from "@/hooks/useVote";
import Image from "next/image";
import TierBadge from "@/app/components/TierBadge";

export default function ArenaDetailVote() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const {
        existingVote,
        loading,
        error,
        refetch: refetchVoteData,
        submitVote,
    } = useVote({
        arenaId: arenaDetail?.id || 0,
        mine: true,
    });

    const isVotedToLeft = existingVote === arenaDetail?.creatorId;
    const isVotedToRight = existingVote === arenaDetail?.challengerId;
    const [remainingTime, setRemainingTime] = useState<string>("");

    const leftPercent = arenaDetail?.leftPercent || 0;
    const rightPercent = arenaDetail?.rightPercent || 0;
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
        await submitVote(arenaDetail.id, votedTo, existingVote);
        refetchVoteData();
    };

    return (
        <div className="mt-6 flex min-h-[200px] w-full max-w-[1000px] animate-fade-in-up flex-col items-center justify-center gap-4 rounded-xl bg-background-300 px-6 py-4">
            {/* 상단 투표 영역 */}
            <div className="relative flex w-full flex-col justify-center gap-4 lg:flex-row lg:items-center">
                {/* 왼쪽 유저 */}
                <div className="flex flex-1 flex-col-reverse items-center justify-start gap-2 text-center lg:flex-row lg:gap-2 lg:text-left">
                    {arenaDetail?.status === 4 ? (
                        <Button
                            label={isVotedToLeft ? "✔" : "투표"}
                            type="purple"
                            onClick={() => handleVote(arenaDetail.creatorId)}
                            disabled={loading}
                        />
                    ) : (
                        <div className="w-full text-center font-bold text-font-100 lg:w-24">
                            {leftPercent}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-body text-font-100">
                        <Image
                            src="/icons/teamA.svg"
                            alt="게시자 아이콘"
                            width={40}
                            height={40}
                        />
                        <span className="max-w-[6rem] truncate">
                            {arenaDetail?.creatorName}
                        </span>
                        <TierBadge score={arenaDetail.creatorScore || 0} />
                    </div>
                </div>

                {/* 중앙 VS or 모바일 게이지 */}
                <div className="flex w-auto justify-center">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-background-200 text-sm font-bold text-white lg:flex">
                        VS
                    </div>
                    <div className="w-full lg:hidden">
                        {arenaDetail?.status === 5 && (
                            <VoteStatusBar
                                voteCount={arenaDetail.voteCount}
                                leftPercent={leftPercent}
                                rightPercent={rightPercent}
                            />
                        )}
                    </div>
                </div>

                {/* 오른쪽 유저 */}
                <div className="flex flex-1 flex-col items-center justify-end gap-2 text-center lg:flex-row lg:gap-2 lg:text-right">
                    <div className="flex flex-row items-center gap-2 text-body text-font-100 lg:flex-row-reverse">
                        <Image
                            src="/icons/teamB.svg"
                            alt="게시자 아이콘"
                            width={40}
                            height={40}
                        />
                        <span className="max-w-[6rem] truncate">
                            {arenaDetail?.challengerName}
                        </span>
                        <TierBadge score={arenaDetail.challengerScore || 0} />
                    </div>

                    {arenaDetail?.status === 4 ? (
                        <Button
                            label={isVotedToRight ? "✔" : "투표"}
                            type="blue"
                            onClick={() => handleVote(arenaDetail.challengerId)}
                            disabled={loading}
                        />
                    ) : (
                        <div className="w-full text-center font-bold text-font-100 lg:w-24">
                            {rightPercent}%
                        </div>
                    )}
                </div>
            </div>

            {/* 데스크탑에선 투표 게이지 별도 위치에 */}
            {arenaDetail?.status === 5 && (
                <div className="mt-4 hidden w-full lg:block">
                    <VoteStatusBar
                        voteCount={arenaDetail.voteCount}
                        leftPercent={leftPercent}
                        rightPercent={rightPercent}
                    />
                </div>
            )}

            {/* 하단 상태 메시지 */}
            <div className="text-center text-sm text-font-100">
                {arenaDetail?.status === 4 ? (
                    <>
                        투표가 진행중입니다. 남은시간:{" "}
                        <span className="font-bold">{remainingTime}</span>
                    </>
                ) : arenaDetail?.status === 5 ? (
                    !arenaDetail.challengerId ? (
                        <>도전자가 없어 투기장이 취소되었습니다.</>
                    ) : arenaDetail.leftPercent === arenaDetail.rightPercent ? (
                        <>투기장이 무승부로 종료되었습니다.</>
                    ) : arenaDetail.leftPercent > arenaDetail.rightPercent ? (
                        <>
                            <span className="px-1 font-bold">
                                {arenaDetail.creatorName}
                            </span>
                            님이 승리하였습니다.
                        </>
                    ) : (
                        <>
                            <span className="px-1 font-bold">
                                {arenaDetail.challengerName}
                            </span>
                            님이 승리하였습니다.
                        </>
                    )
                ) : null}
            </div>

            {/* 에러 메시지 */}
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>
    );
}
