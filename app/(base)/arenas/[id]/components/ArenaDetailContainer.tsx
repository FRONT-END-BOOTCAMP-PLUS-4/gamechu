"use client";

import React, { useEffect, useRef, useState } from "react";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ArenaDetailRecruiting from "./ArenaDetailRecruiting";
import ArenaDetailWaiting from "./ArenaDetailWaiting";
import ArenaDetailInputBox from "./ArenaDetailInputBox";
import ArenaDetailChatList from "./ArenaDetailChatList";

import useArenaStore from "@/stores/UseArenaStore";
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
        !!userId &&
        !!arenaDetail &&
        (userId === arenaDetail.creatorId ||
            userId === arenaDetail.challengerId);

    // InputBox를 비활성화할지 최종 결정
    const isInputBoxDisabled =
        remainingSends === undefined || remainingSends <= 0;

    // InputBox Visible 조건: 상태가 3이고 참여자일 때만 보임
    const isInputBoxVisible = arenaDetail?.status === 3 && isParticipant;

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
        if (content.trim() && isInputBoxVisible && !isInputBoxDisabled) {
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
        <div
            className={`mt-6 flex w-full max-w-[1000px] animate-fade-in-up flex-col gap-4 rounded-3xl bg-background-300 px-4 py-6 ${isInputBoxVisible ? "min-h-[740px]" : "min-h-[500px]"} `}
        >
            <ArenaDetailChatList
                chats={chats}
                ref={chatContainerRef}
                status={arenaDetail?.status}
                creatorId={arenaDetail?.creatorId}
                challengerId={arenaDetail?.challengerId}
                creatorName={arenaDetail?.creatorName}
                challengerName={arenaDetail?.challengerName}
                creatorImageUrl={arenaDetail?.creatorImageUrl}
                challengerImageUrl={arenaDetail?.challengerImageUrl}
            />
            {isInputBoxVisible ? (
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
            ) : (
                <div className="mt-4 flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-font-300/10 bg-background-400/10 py-9">
                    {arenaDetail?.status === 3 && !isParticipant && (
                        <>
                            <div className="flex items-center gap-2 text-sm font-bold text-font-200">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                실시간 토론이 진행 중입니다
                            </div>
                            <p className="text-sm text-font-300">
                                토론 참가자들이 의견을 주고받고 있습니다.
                            </p>
                        </>
                    )}

                    {arenaDetail?.status === 4 && (
                        <>
                            <div className="text-sm font-bold text-font-200">
                                🗳️ 승리자를 위한 투표 시간
                            </div>
                            <p className="text-sm text-font-300">
                                토론이 종료되었으며, 승패를 결정하는 투표가
                                진행됩니다.
                            </p>
                        </>
                    )}

                    {arenaDetail?.status === 5 && (
                        <>
                            <div className="text-sm font-bold text-font-200">
                                🏁 토론 및 투표 종료
                            </div>
                            <p className="text-sm text-font-300">
                                투기장이 종료되었습니다. 결과를 확인해 보세요.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
