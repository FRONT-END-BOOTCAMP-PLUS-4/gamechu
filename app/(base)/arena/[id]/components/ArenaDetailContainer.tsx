"use client";

import Button from "@/app/components/Button";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { useArenaSocket } from "@/hooks/useArenaSocket";
import { ArenaParticipantsDto } from "@/backend/arena/application/usecase/dto/ArenaParticipantsDto";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import ArenaDetailRecruiting from "./ArenaDetailRecruiting";
import ArenaDetailWaiting from "./ArenaDetailWaiting";
import ArenaDetailInputBox from "./ArenaDetailInputBox";
import ArenaDetailChatList from "./ArenaDetailChatList";
import { useArenaStartTimer } from "@/hooks/useArenaStartTimer";

export default function ArenaChatting({ arenaData }: { arenaData: any }) {
    const [chats, setChats] = useState<ChattingDto[]>([]);
    const [content, setContent] = useState("");
    const [participants, setParticipants] =
        useState<ArenaParticipantsDto | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getAuthUserId();
            setUserId(id);
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            });
        }
    }, [chats]);

    const fetchParticipants = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/arenas/${arenaData?.id}/participants`
            );
            const data = await res.json();
            setParticipants(data);
        } catch (err) {
            console.error("참가자 정보 불러오기 실패:", err);
        }
    }, [arenaData?.id]);

    const fetchChats = useCallback(async () => {
        try {
            const res = await fetch(`/api/arenas/${arenaData?.id}/chattings`);
            const data = await res.json();
            setChats(data);
        } catch (err) {
            console.error("채팅 불러오기 실패:", err);
        }
    }, [arenaData?.id]);

    useEffect(() => {
        if (arenaData?.status === 3) {
            fetchChats();
            fetchParticipants();
        }
    }, [arenaData?.status, fetchChats, fetchParticipants]);

    useArenaSocket({
        arenaId: arenaData?.id,
        status: arenaData?.status,
        onReceive: (newChat) => setChats((prev) => [...prev, newChat]),
    });
    useArenaStartTimer({
        arenaId: arenaData?.id,
        status: arenaData?.status,
        startAt: arenaData?.startDate,
        challengerId: participants?.challengerId ?? null,
        onStatusUpdate: (newStatus) => {
            if (newStatus === 3 || newStatus === 5) {
                location.reload();
            }
        },
    });

    const sendMessage = async () => {
        if (!content.trim()) return;

        try {
            const res = await fetch(`/api/arenas/${arenaData?.id}/chattings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) throw new Error("전송 실패");

            const newChat = await res.json();

            socket.emit("chat message", {
                roomId: arenaData?.id.toString(),
                memberId: userId,
                nickname: userId,
                text: newChat.content,
            });

            setChats((prev) => [...prev, newChat]);
            setContent("");
        } catch (err) {
            console.error("채팅 전송 오류:", err);
        }
    };

    if (arenaData?.status === 1) {
        return <ArenaDetailRecruiting arenaData={arenaData} />;
    }

    if (arenaData?.status === 2) {
        return <ArenaDetailWaiting startAt={arenaData.startAt} />;
    }

    return (
        <div className="w-full max-w-[1000px] mt-6 px-4 py-6 bg-background-300 rounded-lg min-h-[740px] flex flex-col animate-fade-in-up">
            <ArenaDetailChatList
                chats={chats}
                participants={participants}
                arenaData={arenaData}
                ref={chatContainerRef}
            />
            <ArenaDetailInputBox
                content={content}
                onChange={(e) => setContent(e.target.value)}
                onSend={sendMessage}
                disabled={
                    !userId ||
                    !participants ||
                    (userId !== participants.creatorId &&
                        userId !== participants.challengerId)
                }
            />
        </div>
    );
}
