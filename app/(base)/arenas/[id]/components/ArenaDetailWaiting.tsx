"use client";

import useArenaStore from "@/stores/useArenaStore";
import { Typewriter } from "react-simple-typewriter";

export default function ArenaDetailWaiting() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    return (
        <div className="w-full max-w-[1000px] mt-6 px-4 py-6 text-center text-font-100 bg-background-300 rounded-lg min-h-[740px] animate-fade-in-up">
            <h2 className="text-lg mb-2 text-font-100">
                <Typewriter
                    words={["토론이 대기 중입니다."]}
                    loop={false}
                    cursor
                    cursorStyle="|"
                    delaySpeed={2000}
                />
            </h2>
            <h2 className="text-sm text-font-light animate-pulse">
                시작 시간:{" "}
                {arenaDetail?.startDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </h2>
        </div>
    );
}
