// socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:8000", {
    // io함수가 서버 주소로 연결을 시도하고 socket이라는 객체를 반환한다.
    // 이 객체를 통해서 서버랑 통신하게 되는 것임
    transports: ["websocket"], // 연결 방식 웹소켓으로 강제로 지정했음
});
