"use client";

import VoteStatusBar from "../../components/VoteStatusBar";
import useArenaStore from "@/stores/useArenaStore";
import { useCallback, useEffect, useState } from "react";
import { useVote } from "@/hooks/useVote";
import TierBadge from "@/app/components/TierBadge";
import Image from "next/image";

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
    const [persistentError, setPersistentError] = useState<string>("");

    // 소수점 제거
    const leftPercent = Math.round(arenaDetail?.leftPercent || 0);
    const rightPercent = Math.round(arenaDetail?.rightPercent || 0);

    useEffect(() => {
        if (error) setPersistentError(error);
    }, [error]);

    const calculateRemainingTime = useCallback(() => {
        if (!arenaDetail?.endVote) return "";
        const now = new Date();
        const end = new Date(arenaDetail.endVote);
        const diffMs = end.getTime() - now.getTime();
        if (diffMs <= 0) return "종료됨";
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
        }, 60000);
        return () => clearInterval(interval);
    }, [calculateRemainingTime]);

    if (arenaDetail?.status !== 4 && arenaDetail?.status !== 5) return null;

    const handleVote = async (votedTo: string | null) => {
        if (!arenaDetail?.id || !votedTo || loading) return;
        setPersistentError("");
        await submitVote(arenaDetail.id, votedTo, existingVote);
        refetchVoteData();
    };

    return (
        <div className="mt-6 flex w-full max-w-[1000px] animate-fade-in-up flex-col gap-4 rounded-[2rem] border border-white/10 bg-background-200/40 p-4 shadow-2xl backdrop-blur-2xl sm:gap-6 sm:p-10">
            {/* 투표 */}
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_100px_1fr] sm:items-stretch sm:gap-0">
                {/* 게시자 */}
                <button
                    onClick={() =>
                        arenaDetail?.status === 4 &&
                        handleVote(arenaDetail.creatorId)
                    }
                    disabled={loading || arenaDetail?.status !== 4}
                    className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-4 transition-all duration-300 sm:rounded-l-3xl sm:p-6 ${arenaDetail?.status === 4 ? "hover:bg-purple-500/10" : ""} ${isVotedToLeft ? "bg-purple-500/15 ring-2 ring-purple-500/50" : "bg-white/5 opacity-80 hover:opacity-100"}`}
                >
                    <div className="absolute inset-0 hidden bg-gradient-to-r from-purple-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:block" />

                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                        <div className="relative">
                            <Image
                                src="/icons/teamA.svg"
                                alt="게시자"
                                width={40}
                                height={40}
                                className={"sm:h-16 sm:w-16"}
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="mb-0 text-[10px] font-medium uppercase tracking-widest text-purple-400 opacity-80 sm:text-xs">
                                Creator
                            </span>
                            <h4 className="text-base font-bold text-font-100 sm:text-2xl">
                                {arenaDetail?.creatorName}
                            </h4>
                            <TierBadge score={arenaDetail?.creatorScore || 0} />
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 w-full sm:mt-6 sm:w-auto">
                        {arenaDetail?.status === 4 ? (
                            <div
                                className={`rounded-full px-6 py-2 text-xs font-bold transition-all sm:px-8 sm:py-3 sm:text-sm ${isVotedToLeft ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "bg-white/10 text-font-200"}`}
                            >
                                {isVotedToLeft ? "투표완료" : "투표하기"}
                            </div>
                        ) : (
                            <div className="text-3xl font-black tabular-nums tracking-tighter text-purple-400 sm:text-4xl">
                                {leftPercent}%
                            </div>
                        )}
                    </div>
                </button>

                {/* 중앙 VS */}
                <div className="relative flex items-center justify-center py-2 sm:py-0">
                    <div className="relative z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-100 shadow-xl sm:h-16 sm:w-16">
                        <span className="text-font-300 text-xs font-black tracking-tighter sm:text-xl">
                            VS
                        </span>
                    </div>
                </div>

                {/* 도전자 */}
                <button
                    onClick={() =>
                        arenaDetail?.status === 4 &&
                        handleVote(arenaDetail.challengerId)
                    }
                    disabled={loading || arenaDetail?.status !== 4}
                    className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-4 transition-all duration-300 sm:rounded-r-3xl sm:p-6 ${arenaDetail?.status === 4 ? "hover:bg-blue-500/10" : ""} ${isVotedToRight ? "bg-blue-500/15 ring-2 ring-blue-500/50" : "bg-white/5 opacity-80 hover:opacity-100"}`}
                >
                    <div className="absolute inset-0 hidden bg-gradient-to-l from-blue-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:block" />

                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                        <div>
                            <Image
                                src="/icons/teamB.svg"
                                alt="도전자"
                                width={40}
                                height={40}
                                className={"sm:h-16 sm:w-16"}
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="mb-0 text-[10px] font-medium uppercase text-blue-400 opacity-80 sm:text-xs">
                                Challenger
                            </span>
                            <h4 className="text-base font-bold text-font-100 sm:text-2xl">
                                {arenaDetail?.challengerName}
                            </h4>
                            <TierBadge
                                score={arenaDetail?.challengerScore || 0}
                            />
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 w-full sm:mt-6 sm:w-auto">
                        {arenaDetail?.status === 4 ? (
                            <div
                                className={`rounded-full px-6 py-2 text-xs font-bold transition-all sm:px-8 sm:py-3 sm:text-sm ${isVotedToRight ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-white/10 text-font-200"}`}
                            >
                                {isVotedToRight ? "투표완료" : "투표하기"}
                            </div>
                        ) : (
                            <div className="text-3xl font-black tabular-nums tracking-tighter text-blue-400 sm:text-4xl">
                                {rightPercent}%
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* 하단 영역 (상태바, 에러, 시간) */}
            <div className="mt-2 space-y-4 sm:mt-4">
                {arenaDetail?.status === 5 && (
                    <VoteStatusBar
                        voteCount={arenaDetail.voteCount}
                        leftPercent={leftPercent}
                        rightPercent={rightPercent}
                    />
                )}

                {/* 에러 메시지 (위치 유지 및 스타일 정수화) */}
                {persistentError && (
                    <div className="flex animate-shake items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                        <span className="flex items-center gap-2">
                            {persistentError}
                        </span>
                        <button
                            onClick={() => setPersistentError("")}
                            className="ml-2 underline opacity-70 hover:opacity-100"
                        >
                            닫기
                        </button>
                    </div>
                )}

                <div className="relative flex items-center justify-center">
                    <div className="absolute w-full border-t border-white/5" />
                    <div className="relative z-10 rounded-xl bg-background-300 px-4 text-center sm:px-6">
                        {arenaDetail?.status === 4 ? (
                            <div className="text-[11px] text-font-200 sm:text-sm">
                                투표 마감까지{" "}
                                <span className="mx-1 font-bold text-red-400">
                                    {remainingTime}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-xs font-bold sm:text-sm">
                                {leftPercent === rightPercent ? (
                                    <>투기장이 무승부로 종료되었습니다.</>
                                ) : (
                                    <>
                                        <span
                                            className={
                                                leftPercent > rightPercent
                                                    ? "text-purple-400"
                                                    : "text-blue-400"
                                            }
                                        >
                                            {leftPercent > rightPercent
                                                ? arenaDetail?.creatorName
                                                : arenaDetail?.challengerName}{" "}
                                        </span>
                                        <span>님이 승리하였습니다!</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
