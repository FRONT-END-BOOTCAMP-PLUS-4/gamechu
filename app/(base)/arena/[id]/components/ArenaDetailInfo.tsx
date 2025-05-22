"use client";

import useArenaStore from "@/stores/useArenaStore";

export default function ArenaDetailInfo() {
    const arenaData = useArenaStore((state) => state.arenaData);
    return (
        <div className="rounded-xl overflow-hidden animate-fade-in-up">
            {/* 상단 제목 영역 */}
            <div className="bg-background-200 px-4 py-3">
                <h2 className="text-h1 font-bold text-font-100">토론 정보</h2>
            </div>

            {/* 정보 리스트 영역 */}
            <div className="bg-background-300 px-4 py-4 flex flex-col gap-4">
                {/* 항목 1 */}
                <div className="flex items-center gap-2 animate-fade-in-left">
                    <img
                        src="/icons/infoMessage.svg"
                        alt="메세지 아이콘"
                        className="w-6 h-6"
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
                <div className="flex items-center gap-2 animate-fade-in-left">
                    <img
                        src="/icons/infoCalendar.svg"
                        alt="달력 아이콘"
                        className="w-6 h-6"
                    />
                    <div className="flex flex-col">
                        <h3 className="text-body font-bold text-font-100">
                            진행 일정
                        </h3>
                        <p className="text-caption text-font-100">
                            {arenaData?.startDate ?? "25.05.14 20:00"} ~{" "}
                        </p>
                    </div>
                </div>

                {/* 항목 3 */}
                <div className="flex items-center gap-2 animate-fade-in-left">
                    <img
                        src="/icons/infoTime.svg"
                        alt="시간 아이콘"
                        className="w-6 h-6"
                    />
                    <div className="flex flex-col">
                        <h3 className="text-body font-bold text-font-100">
                            투표 시간
                        </h3>
                        <p className="text-caption text-font-100">
                            25.05.14 20:00~25.05.15 20:00
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
