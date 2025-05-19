"use client";

import Button from "@/app/components/Button";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import React, { useEffect, useState } from "react";
import { Typewriter } from "react-simple-typewriter";

type ArenaStatus = "recruiting" | "waiting" | "active" | "voting" | "closed";

interface ArenaChattingProps {
    arenaId: number;
    status: ArenaStatus;
    startAt: string; // 예: "25.05.14 20:00"
}

export default function ArenaChatting({
    arenaId,
    status,
    startAt,
}: ArenaChattingProps) {
    const [chats, setChats] = useState<ChattingDto[]>([]);
    const [content, setContent] = useState("");

    const handleSend = async () => {
        const res = await fetch(`/api/arenas/${arenaId}/chattings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
        });

        if (res.ok) {
            console.log("✅ 전송 성공");
            setContent("");
        } else {
            console.error("❌ 전송 실패");
        }
    };
    useEffect(() => {
        if (status !== "active") return;

        const fetchChats = async () => {
            try {
                const res = await fetch(`/api/arenas/${arenaId}/chattings`);
                const data = await res.json();
                console.log("채팅 응답:", data);
                setChats(data);
            } catch (err) {
                console.error("채팅 불러오기 실패:", err);
            }
        };

        fetchChats();
    }, [arenaId, status]);
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
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {chats.length === 0 ? (
                    <p className="text-font-300 text-center mt-4">
                        아직 채팅이 없습니다.
                    </p>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className="bg-background-400 p-3 rounded-lg"
                        >
                            <div className="text-font-100">{chat.content}</div>
                            <div className="text-xs text-font-300 text-right mt-1">
                                {new Date(chat.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* 입력창 + 버튼 */}
            <div className="flex items-end gap-2 mt-auto">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="팀 알파의 의견을 작성하세요... (남은 메시지: 0/5)"
                    className="flex-1 resize-none rounded-lg bg-background-400 p-3 text-font-100 placeholder:text-font-300 h-[80px]"
                />
                <Button
                    label="전송"
                    type="purple"
                    size="xs"
                    onClick={handleSend}
                />
            </div>
        </div>
    );
}
