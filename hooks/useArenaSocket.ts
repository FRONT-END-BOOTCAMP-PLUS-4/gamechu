// hooks/useArenaSocket.ts
import { useEffect, useRef } from "react";
import { socket } from "@/socket";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import { ArenaStatus } from "@/types/arena-status";
type ArenaSocketProps = {
    arenaId: number | undefined;
    status: ArenaStatus | undefined;
    onReceive: (chat: ChattingDto) => void;
}

export function useArenaSocket({
    arenaId,
    status,
    onReceive,
}: ArenaSocketProps) {
    const onReceiveRef = useRef(onReceive);

    useEffect(() => {
        onReceiveRef.current = onReceive; // 최신 onReceive 함수로 업데이트
    }, [onReceive]);

    function onConnect() {
        socket.io.engine.on("upgrade", () => {});
    }
    function onDisconnect() {}
    function onConnectError() {}

    useEffect(() => {
        if (status !== 3) return;
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        if (socket.connected) {
            onConnect();
        } else {
            socket.connect();
        }
        const roomId = arenaId?.toString();
        socket.emit("join room", roomId);

        // 메시지 수신 핸들러
        const handleChatMessage = (msg: {
            memberId: string;
            nickname: string;
            text: string;
            id?: number;
        }) => {
            if (msg.id === undefined) {
                throw new Error("msg.id가 없습니다.");
            }
            const newChat: ChattingDto = {
                // 서버에서 받은 메시지를 기반으로 새로운 채팅 객체 생성
                id: msg.id,
                memberId: msg.memberId,
                arenaId: arenaId as number,
                content: msg.text,
                createdAt: new Date(),
            };
            onReceiveRef.current(newChat); // useArenaSocket을 호출한 곳에서 넘겨준 onReceive콜백 함수 실행
        };

        socket.on("chat message", handleChatMessage); // 서버에서 chat message 이벤트가 오면 실행
        // 클린업 함수: 컴포넌트 언마운트, arenaId/status 변경 시 기존 리스너 해제
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError); // 에러 핸들러 해제

            socket.off("chat message", handleChatMessage); // 메시지 수신 핸들러 해제

            // 룸 나가기 이벤트 발생 (필요하다면)
            // socket.emit("leave room", roomId); // 서버에 룸에서 나간다고 알림
        };
    }, [arenaId, status]);
}
