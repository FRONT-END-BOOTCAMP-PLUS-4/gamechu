"use client";

import Button from "@/app/components/Button";
import React from "react";
import { Typewriter } from "react-simple-typewriter";

type ArenaStatus = "recruiting" | "waiting" | "active" | "voting" | "closed";

interface ArenaChattingProps {
    status: ArenaStatus;
    startAt: string; // 예: "25.05.14 20:00"
}

export default function ArenaChatting({ status, startAt }: ArenaChattingProps) {
    if (status === "recruiting") {
        return (
            <div className="w-full max-w-[1000px] px-4 py-6 mt-6 text-center text-font-200 bg-background-300 rounded-lg min-h-[740px] animate-fade-in-up">
                <h2 className="text-lg mb-2 animate-pulse">
                    도전 상대를 모집 중입니다.
                </h2>
                <p className="text-md mb-2 animate-pulse">도전해보세요!</p>

                {/* 가운데 정렬된 화살표 */}
                <div className="animate-bounce w-fit mx-auto my-4">
                    <img
                        src="/icons/arrowDown.svg"
                        alt="아래 화살표"
                        className="w-6 h-6"
                    />
                </div>

                {/* 참가하기 버튼 */}
                <Button label="참가하기" type="purple" size="large" />
            </div>
        );
    }

    if (status === "waiting") {
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
                    시작 시간: {startAt}
                </h2>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1000px] mt-6 px-4 py-6 bg-background-300 rounded-lg min-h-[740px] flex flex-col animate-fade-in-up">
            <div>{/* 채팅 메시지 */}</div>

            {/* 입력창 + 버튼 */}
            <div className="flex items-end gap-2 mt-auto">
                <textarea
                    placeholder="팀 알파의 의견을 작성하세요... (남은 메시지: 0/5)"
                    className="flex-1 resize-none rounded-lg bg-background-400 p-3 text-font-100 placeholder:text-font-300 h-[80px]"
                />
                <Button
                    label="전송" // 나중에 svg파일로 변경해야함
                    type="purple"
                    size="xs"
                    htmlType="submit"
                />
            </div>
        </div>
    );
}
