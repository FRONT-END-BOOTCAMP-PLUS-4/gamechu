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
    // useArenaSocket에 필요한 userId는 훅 내부에서 가져오므로 여기서 따로 받을 필요 없음
}

interface UseArenaChatManagementReturn {
    chats: ChattingDto[];
    sendMessage: (content: string) => Promise<void>; // 메시지 전송 함수
    loadingChats: boolean; // 초기 채팅 목록 로딩 중 상태
    errorChats: string | null; // 초기 채팅 목록 로딩 에러 상태
    remainingSends: number; // <-- 추가: 남은 메시지 전송 횟수
    sendError: string | null; // <-- 추가: 메시지 전송 시 발생한 에러 메시지 (횟수 초과, 길이 초과 등)
}

// 최대 글자 수와 최대 전송 횟수 상수 정의 (다른 곳과 맞춰야 함)
const MAX_MESSAGE_LENGTH = 200; // 200자
const MAX_SEND_COUNT = 5; // 5회

export function useArenaChatManagement({
    arenaId,
    status,
}: UseArenaChatManagementProps): UseArenaChatManagementReturn {
    const [chats, setChats] = useState<ChattingDto[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState<string | null>(null); // 초기 로딩 에러
    const [userId, setUserId] = useState<string | null>(null); // 메시지 전송에 필요한 유저 ID

    // -- 추가: 남은 메시지 전송 횟수 상태 및 전송 시 에러 상태 --
    const [remainingSends, setRemainingSends] =
        useState<number>(MAX_SEND_COUNT); // 초기값은 일단 최대 횟수로 설정
    const [sendError, setSendError] = useState<string | null>(null); // 메시지 전송 시 에러 메시지

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
        // arenaId가 없거나 status가 3, 4, 5가 아니거나 userId가 없으면 데이터 불러올 필요 없음
        // userId가 있어야 백엔드에서 해당 유저의 보낸 횟수를 조회할 수 있음
        if (
            typeof arenaId !== "number" ||
            ![3, 4, 5].includes(arenaDetail?.status || 0) ||
            !userId
        ) {
            setChats([]); // 조건 안 맞으면 채팅 비우기
            setRemainingSends(MAX_SEND_COUNT); // 남은 횟수 초기화 (보낼 수 없는 상태로)
            setErrorChats(null); // 에러도 초기화
            setSendError(null); // 전송 에러도 초기화
            return;
        }
        setLoadingChats(true);
        setErrorChats(null); // 새 로딩 시작 시 이전 로딩 에러 클리어
        setSendError(null); // 새 로딩 시작 시 이전 전송 에러 클리어

        try {
            // -- 백엔드 GET API 호출 --
            // 백엔드 API가 초기 채팅 목록과 함께
            // "현재 로그인된 유저가 해당 아레나에서 보낸 메시지의 남은 횟수"를 응답에 포함시킨다고 가정
            // 예: 응답 데이터 구조 -> { chats: ChattingDto[], remainingSends: number }
            // userId를 쿼리 파라미터로 보내서 백엔드가 누군지 알게 하거나, 백엔드에서 세션/토큰 등으로 유저 인증 후 ID 가져오기
            const res = await fetch(
                `/api/arenas/${arenaId}/chattings?userId=${userId}`
            ); // userId 파라미터 예시

            if (!res.ok) {
                const data = await res.json();
                // 백엔드에서 온 에러 메시지 사용
                throw new Error(
                    data.error || "채팅 및 횟수 정보 불러오기 실패"
                );
            }

            // -- 백엔드 GET 응답 처리 --
            // 가정: 응답 데이터 구조는 { chats: ChattingDto[], remainingSends: number }
            const data: { chats: ChattingDto[]; remainingSends: number } =
                await res.json();

            setChats(data.chats);
            // -- 남은 횟수 상태 업데이트 --
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
            setErrorChats(errorMessage); // 초기 로딩 에러 상태 업데이트
            console.error("채팅 및 횟수 정보 불러오기 실패:", err);
            // 로딩 실패 시 남은 횟수를 알 수 없으므로, 일단 0으로 설정하여 전송 막기
            setRemainingSends(0);
        } finally {
            setLoadingChats(false);
        }
    }, [arenaId, status, userId, arenaDetail?.status]); // arenaId, status, userId, arenaDetail?.status가 바뀔 때 함수 재생성 -> fetchChats 실행

    // arenaId, status, userId 변경 시 fetchChats 실행
    useEffect(() => {
        fetchChats();
    }, [fetchChats]); // fetchChats 함수 자체가 useCallback으로 감싸져 있으므로 안전

    // useArenaSocket 훅을 사용하여 새 메시지 수신 처리
    useArenaSocket({
        arenaId: arenaId,
        status: status,
        onReceive: useCallback((newChat) => {
            // 새 메시지 수신 시 chats 상태에 추가
            setChats((prev) => [...prev, newChat]);
            // 참고: 본인이 보낸 메시지를 백엔드에서 소켓으로 다시 보내주는 경우
            // POST 성공 시 setChats 하는 코드와 소켓 수신 시 setChats 하는 코드가 중복될 수 있음.
            // 둘 중 하나만 남기거나, 소켓 메시지에 보낸 사람 정보가 있다면 분기 처리가 필요.
        }, []), // setChats는 React가 안정성을 보장하므로 의존성 배열에 넣지 않아도 됨
    });

    // 메시지 전송 함수
    const sendMessage = useCallback(
        async (content: string) => {
            // -- 추가: 메시지 내용 길이 및 남은 횟수 프론트엔드 1차 체크 --
            // 이건 엄격한 보안 체크라기보다 사용자에게 빠른 피드백을 주기 위함
            setSendError(null); // 새 전송 시도 시 이전 전송 에러 클리어

            if (content.trim().length === 0) {
                // 내용이 비어있으면 전송 안함 (InputBox disabled로도 막지만 혹시 몰라 한번 더)
                console.warn("Cannot send message: Content is empty.");
                setSendError("메시지 내용을 입력해주세요.");
                return;
            }
            if (content.trim().length > MAX_MESSAGE_LENGTH) {
                console.warn(
                    "Cannot send message: Content exceeds max length (frontend check)."
                );
                setSendError(
                    `메시지 길이는 ${MAX_MESSAGE_LENGTH}자를 초과할 수 없습니다.`
                );
                return; // 전송 중단
            }
            // remainingSends가 undefined가 아니면서 0 이하일 때
            if (remainingSends !== undefined && remainingSends <= 0) {
                console.warn(
                    "Cannot send message: Send count limit reached (frontend check)."
                );
                setSendError(
                    `메시지 전송 횟수(${MAX_SEND_COUNT}번)를 모두 사용했습니다.`
                );
                return; // 전송 중단
            }

            // arenaId가 없거나 userId가 없으면 전송 안 함 (기존 로직 유지)
            if (typeof arenaId !== "number" || !userId) {
                console.warn("Cannot send message: Missing arenaId or userId.");
                // 필요하다면 에러 메시지 설정
                // setSendError("아레나 정보 또는 사용자 정보가 유효하지 않습니다.");
                return;
            }

            try {
                // -- 백엔드 POST API 호출 --
                // 백엔드에서 글자 수 및 횟수 제한 검증이 엄격하게 이루어져야 함!
                const res = await fetch(`/api/arenas/${arenaId}/chattings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    // -- 백엔드로부터 받은 에러 응답 처리 --
                    // 백엔드에서 발생한 구체적인 에러 메시지(data.error)를 사용
                    let errorMsg =
                        data.error || `메시지 전송 실패: ${res.status}`;

                    // 백엔드 에러 메시지에 특정 키워드가 포함되어 있는지 확인하여 프론트 에러 메시지 결정
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
                        errorMsg = data.error; // 백엔드에서 온 메시지 그대로 사용
                    }
                    // HTTP 상태 코드에 따른 일반적인 에러 메시지도 고려
                    else if (res.status === 401)
                        errorMsg = "메시지 전송에는 로그인이 필요합니다.";
                    else if (res.status === 403)
                        errorMsg = data.error || "메시지 전송 권한이 없습니다.";
                    // 참가자 외 Forbidden 등
                    else if (res.status === 404)
                        errorMsg =
                            data.error || "대상 아레나가 존재하지 않습니다.";
                    else if (res.status === 400)
                        errorMsg = data.error || "잘못된 요청입니다."; // 기타 Bad Request

                    throw new Error(errorMsg); // 구체적인 에러 메시지를 담아 Error 객체 throw
                }
                const resJson = await res.json(); // 전체 응답
                const newChat: ChattingDto = resJson.newChat; // 여기서 content 접근 가능
                setRemainingSends(resJson.remainingSends);
                // setChats((prev) => [...prev, newChat]); // 이거 없으면 안보임
                socket.emit("chat message", {
                    id: newChat.id, // 백엔드에서 생성된 ID 사용
                    roomId: arenaId.toString(),
                    memberId: userId,
                    nickname: userId, // FIXME: 실제 닉네임 필요하면 따로 관리
                    text: newChat.content, // 이제 정상
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
    );
    return {
        chats,
        sendMessage,
        loadingChats, // 초기 로딩 상태
        errorChats, // 초기 로딩 에러 상태
        remainingSends, // <-- 추가: 남은 메시지 전송 횟수 리턴
        sendError, // <-- 추가: 메시지 전송 시 에러 메시지 리턴
    };
}
