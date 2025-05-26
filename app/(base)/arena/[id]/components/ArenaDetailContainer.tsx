"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ArenaDetailRecruiting from "./ArenaDetailRecruiting";
import ArenaDetailWaiting from "./ArenaDetailWaiting";
import ArenaDetailInputBox from "./ArenaDetailInputBox";
import ArenaDetailChatList from "./ArenaDetailChatList";

import useArenaStore from "@/stores/useArenaStore";
import { useArenaChatManagement } from "@/hooks/useArenaChatManagement";

export default function ArenaDetailContainer() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const { chats, sendMessage } = useArenaChatManagement({
        arenaId: arenaDetail?.id,
        status: arenaDetail?.status,
    });

    // 채팅 입력창 상태 관리
    const [content, setContent] = useState("");

    // 유저 ID 상태 관리
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getAuthUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    // 채팅 목록 업데이트 될 때 스크롤하기
    const chatContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            });
        }
    }, [chats]);

    //todo: 토론 스타트 타이머 훅 아마 나중에 서버에서 자동으로 하거나 투기장 리스트 페이지 들어갔을 때로 바꿔야할듯?
    // useArenaStartTimer({
    //     onStatusUpdate: (newStatus) => {
    //         if (newStatus === 3 || newStatus === 5) {
    //             location.reload();
    //         }
    //     },
    // });

    // useVoteStartTimer({
    //     onStatusUpdate: (newStatus) => {
    //         console.log("투표 종료됨!", newStatus);
    //     },
    // });

    // useCloseArenaTimer({
    //     onStatusUpdate: (newStatus) => {
    //         console.log("투표가 종료되어 상태가 바뀌었습니다:", newStatus);
    //         // 예: 결과 화면 보여주기 등 추가 로직
    //     },
    // });

    if (arenaDetail?.status === 1) {
        return <ArenaDetailRecruiting />;
    }

    if (arenaDetail?.status === 2) {
        return <ArenaDetailWaiting />;
    }

    // 상태 3 이상일 때 (Active, Voting, Closed 등) 채팅 관련 UI 렌더링
    return (
        <div className="w-full max-w-[1000px] mt-6 px-4 py-6 bg-background-300 rounded-lg min-h-[740px] flex flex-col animate-fade-in-up">
            <ArenaDetailChatList chats={chats} ref={chatContainerRef} />
            <ArenaDetailInputBox
                content={content}
                onChange={(e) => setContent(e.target.value)}
                onSend={() => {
                    sendMessage(content); // 훅에서 가져온 sendMessage 호출
                    setContent(""); // 메시지 보낸 후 입력창 비우기
                }}
                disabled={
                    !userId ||
                    !arenaDetail ||
                    (userId !== arenaDetail.creatorId &&
                        userId !== arenaDetail.challengerId)
                }
            />
        </div>
    );
}
