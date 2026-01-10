"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ArenaDetailRecruiting from "./ArenaDetailRecruiting";
import ArenaDetailWaiting from "./ArenaDetailWaiting";
import ArenaDetailInputBox from "./ArenaDetailInputBox";
import ArenaDetailChatList from "./ArenaDetailChatList";

import useArenaStore from "@/stores/useArenaStore";
import { useArenaChatManagement } from "@/hooks/useArenaChatManagement";
const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;
export default function ArenaDetailContainer() {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    const { chats, sendMessage, remainingSends, sendError } =
        useArenaChatManagement({
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

    // 사용자가 creator 또는 challenger인지 확인
    const isParticipant =
        userId &&
        arenaDetail &&
        (userId === arenaDetail.creatorId ||
            userId === arenaDetail.challengerId);

    // InputBox를 비활성화할지 최종 결정
    const isInputBoxDisabled =
        !isParticipant ||
        arenaDetail?.status !== 3 ||
        remainingSends === undefined ||
        remainingSends <= 0;
    // 글자 수 변경 핸들러 (200자 제한 적용)
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        // 입력된 값의 길이가 최대 글자 수를 넘지 않으면 상태 업데이트
        if (value.length <= MAX_MESSAGE_LENGTH) {
            setContent(value);
        } else {
            setContent(value.slice(0, MAX_MESSAGE_LENGTH));
        }
    };

    // 메시지 전송 핸들러
    const handleSendMessage = () => {
        if (content.trim() && !isInputBoxDisabled) {
            sendMessage(content);
            setContent("");
        }
    };
    if (arenaDetail?.status === 1) {
        return <ArenaDetailRecruiting />;
    }

    if (arenaDetail?.status === 2) {
        return <ArenaDetailWaiting />;
    }
    // 상태 3 이상일 때 (Active, Voting, Closed 등) 채팅 관련 UI 렌더링
    return (
        <div className="mt-6 flex min-h-[740px] w-full max-w-[1000px] animate-fade-in-up flex-col rounded-3xl bg-background-300 px-4 py-6">
            <ArenaDetailChatList chats={chats} ref={chatContainerRef} />
            <ArenaDetailInputBox
                content={content}
                onChange={handleContentChange} // 수정된 글자 수 제한 핸들러
                onSend={handleSendMessage} // 수정된 전송 핸들러
                disabled={isInputBoxDisabled} // 계산된 최종 disabled 상태 전달
                maxLength={MAX_MESSAGE_LENGTH} // 최대 글자 수 상수 전달
                currentLength={content.length} // 현재 입력된 글자 수 전달
                remainingSends={remainingSends ?? MAX_SEND_COUNT} // 훅에서 받아온 남은 횟수 (초기값 고려)
                totalSends={MAX_SEND_COUNT} // 전체 허용 횟수 상수 전달
                sendError={sendError} // 훅에서 받아온 전송 에러 메시지 전달
            />
        </div>
    );
}
