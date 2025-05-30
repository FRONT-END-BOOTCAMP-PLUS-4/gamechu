// hooks/useArenaChatManagement.ts
import { useState, useEffect, useCallback } from "react";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import { ArenaStatus } from "@/types/arena-status";
import { useArenaSocket } from "./useArenaSocket";
import { socket } from "@/socket";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import useArenaStore from "@/stores/useArenaStore";

interface UseArenaChatManagementProps {
    arenaId: number | undefined;
    status: ArenaStatus | undefined;
}

interface UseArenaChatManagementReturn {
    chats: ChattingDto[];
    sendMessage: (content: string) => Promise<void>;
    loadingChats: boolean;
    errorChats: string | null;
    remainingSends: number;
    sendError: string | null;
}

const MAX_MESSAGE_LENGTH = 200;
const MAX_SEND_COUNT = 5;

export function useArenaChatManagement({
    arenaId,
    status,
}: UseArenaChatManagementProps): UseArenaChatManagementReturn {
    const [chats, setChats] = useState<ChattingDto[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [remainingSends, setRemainingSends] =
        useState<number>(MAX_SEND_COUNT);
    const [sendError, setSendError] = useState<string | null>(null);

    const arenaDetail = useArenaStore((state) => state.arenaData);

    // 훅 마운트 시 유저 ID 가져오기
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getAuthUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    // 초기 채팅 목록 및 사용자 전송 횟수 불러오기 로직
    const fetchChats = useCallback(async () => {
        if (
            typeof arenaId !== "number" ||
            ![3, 4, 5].includes(arenaDetail?.status || 0)
        ) {
            setChats([]);
            setRemainingSends(MAX_SEND_COUNT);
            setErrorChats(null);
            setSendError(null);
            return;
        }
        setLoadingChats(true);
        setErrorChats(null);
        setSendError(null);

        try {
            // -- 백엔드 GET API 호출 --
            const res = await fetch(`/api/arenas/${arenaId}/chattings`);

            if (!res.ok) {
                const data = await res.json();
                // 백엔드에서 온 에러 메시지 사용
                throw new Error(
                    data.error || "채팅 및 횟수 정보 불러오기 실패"
                );
            }

            // -- 백엔드 GET 응답 처리 --
            const data: { chats: ChattingDto[]; remainingSends: number } =
                await res.json();
            setChats(data.chats);
            // 백엔드에서 받은 남은 횟수로 상태를 업데이트
            setRemainingSends(data.remainingSends);
        } catch (err) {
            let errorMessage =
                "채팅 및 횟수 정보 불러오기 중 알 수 없는 오류가 발생했습니다.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            }
            setErrorChats(errorMessage);
            console.error("채팅 및 횟수 정보 불러오기 실패:", err);
            // 로딩 실패 시 남은 횟수를 알 수 없으므로, 일단 0으로 설정하여 전송 막기
            setRemainingSends(0);
        } finally {
            setLoadingChats(false);
        }
    }, [arenaId, status, userId, arenaDetail?.status]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // useArenaSocket 훅을 사용하여 새 메시지 수신 처리
    useArenaSocket({
        arenaId: arenaId,
        status: status,
        onReceive: useCallback((newChat) => {
            // 새 메시지 수신 시 chats 상태에 추가
            setChats((prev) => {
                if (prev.some((chat) => chat.id === newChat.id)) return prev; // 중복 제거
                return [...prev, newChat];
            });
        }, []),
    });

    // 메시지 전송 함수
    const sendMessage = useCallback(
        async (content: string) => {
            // 추가: 메시지 내용 길이 및 남은 횟수 프론트엔드 1차 체크
            setSendError(null);

            if (content.trim().length === 0) {
                setSendError("메시지 내용을 입력해주세요.");
                return;
            }
            if (content.trim().length > MAX_MESSAGE_LENGTH) {
                setSendError(
                    `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`
                );
                return;
            }
            // remainingSends가 undefined가 아니면서 0 이하일 때
            if (remainingSends !== undefined && remainingSends <= 0) {
                setSendError(
                    `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
                );
                return;
            }

            // arenaId가 없거나 userId가 없으면 전송 안 함
            if (typeof arenaId !== "number" || !userId) {
                return;
            }

            try {
                // 백엔드 POST API 호출
                const res = await fetch(`/api/arenas/${arenaId}/chattings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    // 백엔드로부터 받은 에러 응답 처리
                    let errorMsg =
                        data.error || `메시지 전송 실패: ${res.status}`;

                    if (
                        data.error?.includes("메시지 길이가 너무 깁니다") ||
                        data.error?.includes("length limit")
                    ) {
                        errorMsg = `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`;
                    } else if (
                        data.error?.includes(
                            "메시지 전송 횟수를 초과했습니다"
                        ) ||
                        data.error?.includes("send count limit")
                    ) {
                        errorMsg = `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`;
                        // 백엔드에서 횟수 초과가 확실히 발생했다면 프론트 상태도 0으로 업데이트
                        setRemainingSends(0);
                    } else if (
                        data.error?.includes("참가자가 아닙니다") ||
                        data.error?.includes("Not a participant")
                    ) {
                        errorMsg = "아레나 참가자만 메시지를 보낼 수 있습니다.";
                    } else if (
                        data.error?.includes(
                            "지금은 메시지를 보낼 수 없는 아레나 상태입니다"
                        )
                    ) {
                        errorMsg = data.error;
                    } else if (res.status === 401)
                        errorMsg = "메시지 전송에는 로그인이 필요합니다.";
                    else if (res.status === 403)
                        errorMsg = data.error || "메시지 전송 권한이 없습니다.";
                    // 참가자 외 Forbidden 등
                    else if (res.status === 404)
                        errorMsg =
                            data.error || "대상 아레나가 존재하지 않습니다.";
                    else if (res.status === 400)
                        errorMsg = data.error || "잘못된 요청입니다.";

                    throw new Error(errorMsg);
                }
                const data: { newChat: ChattingDto; remainingSends: number } =
                    await res.json();
                const newChat = data.newChat;
                setRemainingSends(data.remainingSends);
                setChats((prev) => [...prev, newChat]); // 이거 없으면 안보임
                socket.emit("chat message", {
                    id: newChat.id, // 백엔드에서 생성된 ID 사용
                    roomId: arenaId.toString(),
                    memberId: userId,
                    nickname: userId, // 실제 닉네임 필요하면 따로 관리
                    text: newChat.content,
                });
            } catch (err) {
                let errorMessage =
                    "채팅 전송 중 알 수 없는 오류가 발생했습니다.";
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (typeof err === "string") {
                    errorMessage = err;
                }
                console.error("채팅 전송 오류:", err);
                setErrorChats(errorMessage);
            }
        },
        [arenaId, userId]
    );
    return {
        chats,
        sendMessage,
        loadingChats,
        errorChats,
        remainingSends,
        sendError,
    };
}
