// hooks/useArenaSocket.ts
import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import { ArenaStatus } from "@/types/arena-status";

interface ArenaSocketProps {
    arenaId: number;
    status: ArenaStatus;
    onReceive: (chat: ChattingDto) => void;
}

export function useArenaSocket({
    arenaId,
    status,
    onReceive,
}: ArenaSocketProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const onReceiveRef = useRef(onReceive);

    useEffect(() => {
        onReceiveRef.current = onReceive; // 최신 onReceive 함수로 업데이트
    }, [onReceive]);
    function onConnect() {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        console.log("transport: ", transport);
        console.log("socket connected: ", isConnected);
        socket.io.engine.on("upgrade", (transport) => {
            setTransport(transport.name);
        });
    }
    useEffect(() => {
        if (status !== 3) return;
        if (socket.connected) {
            onConnect();
        }
        // 방 입장
        socket.emit("join room", arenaId.toString());
        console.log("join room", arenaId.toString());

        // 메시지 수신 핸들러
        const sendMessage = (msg: {
            memberId: string;
            nickname: string;
            text: string;
        }) => {
            const newChat: ChattingDto = {
                // 서버에서 받은 메시지를 기반으로 새로운 채팅 객체 생성
                id: -1, // auto increment이므로 -1로 설정
                memberId: msg.memberId,
                arenaId,
                content: msg.text,
                createdAt: new Date(),
            };
            onReceiveRef.current(newChat); // 새로운 채팅 수신 시 상태 업데이트
        };

        socket.on("chat message", sendMessage);
        return () => {
            socket.off("chat message", sendMessage);
        };
    }, [arenaId, status]);
}
