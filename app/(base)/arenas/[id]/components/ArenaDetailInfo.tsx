"use client";

import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

export default function ArenaDetailInfo() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    return (
        <div className="min-w-[280px] animate-fade-in-up overflow-hidden rounded-xl">
            {/* 상단 제목 영역 */}
            <div className="bg-background-200 px-4 py-3">
                <h2 className="text-h1 font-bold text-font-100">토론 정보</h2>
            </div>

            {/* 정보 리스트 영역 */}
            <div className="flex flex-col gap-4 bg-background-300 px-4 py-4">
                {/* 항목 1 */}
                <div className="flex animate-fade-in-left items-center gap-2">
                    <Image
                        src="/icons/infoMessage.svg"
                        alt="메세지 아이콘"
                        width={24}
                        height={24}
                    />
                    <div className="flex flex-col">
                        <h3 className="text-body font-bold text-font-100">
                            메시지 제한
                        </h3>
                        <p className="text-caption text-font-100">
                            각 참여자 200자씩 5개 메시지
                        </p>
                    </div>
                </div>

                {/* 항목 2 */}
                <div className="flex animate-fade-in-left items-center gap-2">
                    <Image
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        width={24}
                        height={24}
                    />
                    <div className="flex flex-col">
                        <h3 className="text-body font-bold text-font-100">
                            진행 일정
                        </h3>
                        <p className="max-w-[180px] text-caption text-font-100 sm:max-w-none lg:max-w-[180px]">
                            {arenaDetail?.startDate.toLocaleDateString(
                                "ko-KR",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}{" "}
                            ~{" "}
                            {arenaDetail?.endChatting.toLocaleDateString(
                                "ko-KR",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    </div>
                </div>

                {/* 항목 3 */}
                <div className="flex animate-fade-in-left items-center gap-2">
                    <Image
                        src="/icons/infoTime.svg"
                        alt="시간 아이콘"
                        width={24}
                        height={24}
                    />
                    <div className="flex flex-col">
                        <h3 className="text-body font-bold text-font-100">
                            투표 시간
                        </h3>
                        <p className="max-w-[180px] text-caption text-font-100 sm:max-w-none lg:max-w-[160px]">
                            {arenaDetail?.endChatting.toLocaleDateString(
                                "ko-KR",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}{" "}
                            ~{" "}
                            {arenaDetail?.endVote.toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
