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
            {/* 투표 안내 문구 */}
            {arenaDetail?.status === 4 && (
                <div className="relative flex items-center justify-center">
                    <div className="relative z-10 rounded-xl border border-white/5 bg-background-200/50 px-4 py-1 text-center sm:px-6">
                        <div className="text-xs font-semibold text-font-100 sm:text-sm">
                            투표를 통해 승자를 선택해주세요!
                        </div>
                    </div>
                </div>
            )}

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
                            {/* 투표 완료 체크 표시 (좌측) */}
                            {isVotedToLeft && (
                                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-purple-100 text-xs text-white ring-2 ring-background-200">
                                    ✓
                                </div>
                            )}
                            <Image
                                src="/icons/teamA.svg"
                                alt="게시자"
                                width={40}
                                height={40}
                                className="sm:h-16 sm:w-16"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="mb-0 text-[10px] font-medium uppercase text-purple-400 opacity-80 sm:text-xs">
                                Creator
                            </span>
                            <h4 className="text-base font-bold text-font-100 sm:text-2xl">
                                {arenaDetail?.creatorName}
                            </h4>
                            <TierBadge score={arenaDetail?.creatorScore || 0} />
                        </div>
                    </div>
                    {arenaDetail?.status === 5 && (
                        <div className="relative z-10 mt-4 text-3xl font-black tabular-nums tracking-tighter text-purple-400 sm:mt-6 sm:text-4xl">
                            {leftPercent}%
                        </div>
                    )}
                </button>

                {/* 중앙 VS */}
                <div className="relative flex items-center justify-center py-2 sm:py-0">
                    <div className="relative z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background-100 shadow-xl sm:h-16 sm:w-16">
                        <span className="text-xs font-black tracking-tighter text-font-200 sm:text-xl">
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
                        <div className="relative">
                            {/* 투표 완료 체크 표시 (우측) */}
                            {isVotedToRight && (
                                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-blue-100 text-xs text-white ring-2 ring-background-200">
                                    ✓
                                </div>
                            )}
                            <Image
                                src="/icons/teamB.svg"
                                alt="도전자"
                                width={40}
                                height={40}
                                className="sm:h-16 sm:w-16"
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
                    {arenaDetail?.status === 5 && (
                        <div className="relative z-10 mt-4 text-3xl font-black tabular-nums tracking-tighter text-blue-400 sm:mt-6 sm:text-4xl">
                            {rightPercent}%
                        </div>
                    )}
                </button>
            </div>

            {/* 하단 영역 */}
            <div className="mt-2 space-y-2 sm:mt-4">
                {arenaDetail?.status === 5 && (
                    <VoteStatusBar
                        voteCount={arenaDetail.voteCount}
                        leftPercent={leftPercent}
                        rightPercent={rightPercent}
                    />
                )}

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
                                                : arenaDetail?.challengerName}
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
