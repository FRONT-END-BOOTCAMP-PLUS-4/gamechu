"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailInfo() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    return (
        <div className="min-w-[280px] animate-fade-in-up overflow-hidden rounded-xl border border-background-200 bg-background-300 shadow-sm">
            {/* 상단 제목 영역 */}
            <div className="flex items-center gap-2 bg-background-200 p-3">
                <div className="bg-primary-100 h-3 w-1 rounded-full" />
                <h2 className="text-base font-extrabold tracking-tight text-font-100">
                    토론 정보
                </h2>
            </div>

            {/* 정보 리스트 영역 */}
            <div className="flex flex-col gap-4 bg-background-300 px-4 py-5">
                {/* 항목 1 */}
                <div className="flex animate-fade-in-left items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background-200/50">
                        <Image
                            src="/icons/infoMessage.svg"
                            alt="메세지 아이콘"
                            width={18}
                            height={18}
                        />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-xs font-bold text-font-200">
                            메시지 제한
                        </h3>
                        <p className="text-xs font-bold text-font-100 sm:text-sm">
                            각 참여자 200자씩 5개 메시지
                        </p>
                    </div>
                </div>

                {/* 항목 2 */}
                <div className="flex animate-fade-in-left items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background-200/50">
                        <Image
                            src="/icons/infoCalendar.svg"
                            alt="달력 아이콘"
                            width={18}
                            height={18}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-bold text-font-200">
                            진행 일정
                        </h3>
                        <div className="flex flex-col gap-1 border-l border-background-200 pl-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-300">
                                    시작
                                </span>
                                <p className="text-xs font-semibold text-font-100 sm:text-sm">
                                    {arenaDetail?.startDate.toLocaleDateString(
                                        "ko-KR",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-400">
                                    종료
                                </span>
                                <p className="text-xs font-semibold text-font-100 sm:text-sm">
                                    {arenaDetail?.endChatting.toLocaleDateString(
                                        "ko-KR",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 항목 3 */}
                <div className="flex animate-fade-in-left items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-background-200/50">
                        <Image
                            src="/icons/infoTime.svg"
                            alt="시간 아이콘"
                            width={18}
                            height={18}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xs font-bold text-font-200">
                            투표 시간
                        </h3>
                        <div className="flex flex-col gap-1 border-l border-background-200 pl-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-300">
                                    시작
                                </span>
                                <p className="text-xs font-semibold text-font-100 sm:text-sm">
                                    {arenaDetail?.endChatting.toLocaleDateString(
                                        "ko-KR",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-400">
                                    종료
                                </span>
                                <p className="text-xs font-semibold text-font-100 sm:text-sm">
                                    {arenaDetail?.endVote.toLocaleDateString(
                                        "ko-KR",
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
