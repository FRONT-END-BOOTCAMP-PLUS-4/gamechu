// hooks/useArenaChatManagement.ts
import { useState, useEffect, useCallback } from "react";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import { ArenaStatus } from "@/types/arena-status";
import { useArenaSocket } from "./useArenaSocket";
import { socket } from "@/socket";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";

interface UseArenaChatManagementProps {
    arenaId: number | undefined;
    status: ArenaStatus | undefined;
    // 필요한 경우 참가자 정보도 여기서 가져오거나 props로 받을 수 있음
    // participants: ArenaParticipantsDto | null; // 만약 채팅 리스트나 보내기 로직에 필요하면
}

interface UseArenaChatManagementReturn {
    chats: ChattingDto[];
    sendMessage: (content: string) => Promise<void>; // 메시지 보내는 함수
    loadingChats: boolean; // 초기 채팅 로딩 상태
    errorChats: string | null; // 초기 채팅 로딩 에러 상태
    // 필요한 경우 유저 ID나 참가자 정보도 여기서 리턴할 수 있음
    // userId: string | null;
    // participants: ArenaParticipantsDto | null;
}

export function useArenaChatManagement({
    arenaId,
    status,
}: UseArenaChatManagementProps): UseArenaChatManagementReturn {
    const [chats, setChats] = useState<ChattingDto[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null); // 메시지 보낼 때 필요한 유저 ID

    // 훅 마운트 시 유저 ID 가져오기
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getAuthUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    // 초기 채팅 목록 불러오기 로직
    const fetchChats = useCallback(async () => {
        // arenaId가 없거나 status가 3(진행 중)이 아니면 채팅 불러올 필요 없음
        if (typeof arenaId !== "number" || status !== 3) {
            setChats([]); // 상태에 맞지 않으면 채팅 비우기
            return;
        }
        setLoadingChats(true);
        setErrorChats(null);
        try {
            const res = await fetch(`/api/arenas/${arenaId}/chattings`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "채팅 불러오기 실패");
            }
            const data: ChattingDto[] = await res.json(); // 타입 명시
            setChats(data);
        } catch (err) {
            let errorMessage =
                "채팅 불러오기 중 알 수 없는 오류가 발생했습니다.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            }
            setErrorChats(errorMessage);
            console.error("채팅 불러오기 실패:", err);
        } finally {
            setLoadingChats(false);
        }
    }, [arenaId, status]); // arenaId와 status가 바뀔 때 다시 fetch

    // arenaId나 status가 변경될 때 fetchChats 실행
    useEffect(() => {
        fetchChats();
    }, [fetchChats]); // fetchChats 콜백이 의존성에 있으므로 안전

    // useArenaSocket 훅을 사용하여 새 메시지 수신 처리
    useArenaSocket({
        arenaId: arenaId,
        status: status,
        onReceive: useCallback((newChat) => {
            setChats((prev) => [...prev, newChat]); //생성된 채팅 객체를 chats에 저장
        }, []), // setChats는 상태 업데이트 함수이므로 의존성에 넣지 않아도 됨 (React 보장)
    });

    // 메시지 전송 함수
    const sendMessage = useCallback(
        async (content: string) => {
            // 내용이 비었거나 arenaId가 없거나 userId가 없으면 전송 안 함
            if (!content.trim() || typeof arenaId !== "number" || !userId)
                return;

            try {
                const res = await fetch(`/api/arenas/${arenaId}/chattings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "채팅 전송 실패");
                }

                const newChat: ChattingDto = await res.json(); // 전송 후 서버 응답 (새로 생성된 채팅 객체)

                // 서버에서 소켓 메시지를 다시 보내줄 경우, useArenaSocket의 onReceive에서 chats 상태가 업데이트됨.
                // 만약 서버가 전송한 클라이언트에게는 소켓 메시지를 에코해주지 않는다면, 여기서 setChats를 호출해야 함.
                // 일반적으로는 서버가 모든 클라이언트(보낸 사람 포함)에게 메시지를 broadcast 하므로 아래 주석 처리된 코드는 필요 없을 가능성이 높음.
                setChats((prev) => [...prev, newChat]); // 소켓으로 안 온다면 여기서 직접 상태 업데이트 (이거 없으면 내가보낸거 바로 안보임)

                // 소켓으로 메시지 전송 (다른 클라이언트들에게 알림)
                // 서버에서 전송된 메시지를 다시 소켓으로 받아서 처리하는 구조라면 이 emit 로직이 서버에 있어야 할 수도 있음.
                // 클라이언트에서 직접 emit 하는 구조라면 이 코드가 맞음.
                socket.emit("chat message", {
                    roomId: arenaId.toString(),
                    memberId: userId,
                    nickname: userId, // 실제 닉네임이 필요하면 userId 대신 닉네임 상태를 관리해야 함
                    text: newChat.content, // 서버 응답에서 온 내용 사용
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
                // 필요한 경우 전송 에러 상태도 관리해서 UI에 표시
            }
        },
        [arenaId, userId]
    ); // arenaId와 userId가 바뀔 때 함수 재생성

    return {
        chats,
        sendMessage,
        loadingChats,
        errorChats,
        // userId, // 필요하면 리턴
    };
}
