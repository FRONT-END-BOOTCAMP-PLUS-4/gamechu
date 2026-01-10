"use client";

import useArenaStore from "@/stores/useArenaStore";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";

export default function ArenaDetailWaiting() {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="mt-6 flex min-h-[500px] w-full max-w-[1000px] animate-fade-in-up flex-col items-center justify-center rounded-3xl border border-white/10 bg-background-300 px-8 py-8 text-center sm:px-10 sm:py-20">
            {/* 상단 타이틀 섹션 */}
            <div className="mb-6 flex flex-col gap-1">
                <div className="text-xl font-black tracking-tight text-white sm:text-3xl">
                    <Typewriter
                        words={["토론을 준비 중입니다..."]}
                        loop={true}
                        cursor
                        cursorStyle="|"
                        delaySpeed={3000}
                    />
                </div>
                <p className="text-[10px] font-bold tracking-widest text-white/30 sm:text-xs">
                    PREPARING FOR BATTLE
                </p>
            </div>

            <div className="mb-6 flex w-full flex-col items-center justify-center gap-2 sm:mb-12 sm:flex-row sm:gap-4">
                {/* 작성자 */}
                <div className="relative flex w-full flex-col items-center rounded-2xl border-2 border-primary-purple-300/50 bg-gradient-to-b from-white/10 to-transparent py-4 transition-all sm:flex-1 sm:gap-4 sm:px-4 sm:py-6">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary-purple-300 px-3 py-1 text-xs font-semibold tracking-widest text-white shadow-lg">
                        CREATOR
                    </div>
                    <div className="relative flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
                        <Image
                            src="/icons/teamA.svg"
                            alt="작성자"
                            width={64}
                            height={64}
                            className="relative h-12 w-12 transition-transform sm:h-16 sm:w-16"
                        />
                    </div>
                    <span className="relative break-all text-lg font-semibold text-white sm:text-xl">
                        {arenaDetail?.creatorName ?? "작성자"}
                    </span>
                </div>

                {/* VS 섹션 */}
                <div className="relative flex shrink-0 items-center justify-center py-4">
                    <span className="relative animate-pulse text-2xl font-black tracking-tighter text-white opacity-20 sm:text-5xl">
                        VS
                    </span>
                </div>

                {/* 도전자 */}
                <div className="relative flex w-full flex-col items-center rounded-2xl border-2 border-primary-blue-200/50 bg-gradient-to-b from-white/10 to-transparent py-4 transition-all sm:flex-1 sm:gap-4 sm:px-4 sm:py-6">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary-blue-200 px-3 py-1 text-xs font-semibold tracking-widest text-white shadow-lg">
                        CHALLENGER
                    </div>
                    <div className="relative flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
                        <Image
                            src="/icons/teamB.svg"
                            alt="도전자"
                            width={64}
                            height={64}
                            className="relative h-12 w-12 transition-transform sm:h-16 sm:w-16"
                        />
                    </div>
                    <span className="relative break-all text-lg font-semibold text-white sm:text-xl">
                        {arenaDetail?.challengerName ?? "도전자 대기 중"}
                    </span>
                </div>
            </div>

            {/* 시작 시간 안내 */}
            <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-6 shadow-2xl backdrop-blur-md transition-all sm:max-w-md">
                <span className="flex items-center text-[10px] font-bold tracking-widest text-white/40 sm:text-xs">
                    STARTING AT
                </span>
                <h2 className="text-base font-black text-white sm:text-xl">
                    {arenaDetail?.startDate.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </h2>
            </div>
        </div>
    );
}
