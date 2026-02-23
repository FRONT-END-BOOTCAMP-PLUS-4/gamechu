"use client";

import Image from "next/image";

export default function GamePageHeader() {
    return (
        <div className="relative flex flex-col gap-4 px-6 py-4">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background-300 shadow-lg ring-1 ring-white/10">
                            <Image
                                src="/icons/gamesearch.svg"
                                alt="게임 탐색 아이콘"
                                width={26}
                                height={26}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-font-100 sm:text-3xl">
                            게임 탐색
                        </h1>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        {/* 헤드라인 라벨 */}
                        <div className="flex items-center gap-2 pr-2 md:border-r md:border-white/10">
                            <div className="h-1 w-1 animate-pulse rounded-full bg-primary-purple-100" />
                            <span className="text-[12px] font-bold uppercase tracking-wider text-purple-400">
                                포인트 규칙
                            </span>
                        </div>

                        {/* 규칙 아이템 리스트 */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 rounded-full bg-background-300 py-1 pl-1 pr-3 ring-1 ring-white/5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-300">
                                    +
                                </span>
                                <span className="text-sm font-medium text-font-200">
                                    리뷰 좋아요 획득 시{" "}
                                    <span className="ml-0.5 font-bold text-green-400">
                                        5P 획득
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-full bg-background-300 py-1 pl-1 pr-3 ring-1 ring-white/5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-300">
                                    -
                                </span>
                                <span className="text-sm font-medium text-font-200">
                                    리뷰 삭제 시 받은{" "}
                                    <span className="ml-0.5 font-bold text-red-400">
                                        포인트 회수
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[340px] border-l-2 border-primary-purple-100/30 pl-4 md:border-l-0 md:border-r-2 md:pl-0 md:pr-4 md:text-right">
                    <p className="break-keep text-[13px] font-medium leading-relaxed text-font-300">
                        다양한 게임 속 생생한 리뷰를 확인하고 직접 경험을
                        공유하세요.
                        <br className="hidden md:block" />
                        좋은 리뷰는 누군가에게 새로운 인생 게임이 될 수
                        있습니다.
                    </p>
                </div>
            </div>

            <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-line-200/20 to-transparent" />
        </div>
    );
}
