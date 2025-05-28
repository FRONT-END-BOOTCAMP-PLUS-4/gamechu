import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import type { Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 8000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const server = createServer(handler);
const io = new Server(server); //소켓 서버 인스턴스 생성

app.prepare().then(() => {
    io.on("connection", (socket: Socket) => {
        // 새 클라이언트가 서버로 소켓 연결을 할 때마다 이 코드가 실행됨
        console.log(`Socket-Server: a user connected (id: ${socket.id})`);
        socket.on("join room", (roomId: string) => {
            // 클라이언트가 emit으로 메세지 보내면 "join room" 이게 잡아줌
            socket.join(roomId);
            console.log(
                `Socket-Server: User ${socket.id} joined room ${roomId}`
            );
        });

        socket.on(
            "chat message", // 클라이언트가 메세지 보내면 이 코드가 잡아서 메세지 내용을 받음
            (msg: {
                id: number;
                roomId: string;
                memberId: string;
                nickname: string;
                text: string;
            }) => {
                io.to(msg.roomId).emit("chat message", msg); // 나 포함 접속한 모두에게 뿌림
                console.log(
                    `${msg.id}, ${msg.roomId}, ${msg.memberId}, ${msg.nickname}, ${msg.text}`
                );
            }
        );

        socket.on("disconnect", () => {
            // 클라이언트 연결이 끊어지면 실행 됨
            console.log("user disconnected");
        });
        // 추가: 에러 핸들링 (클라이언트 소켓에서 발생한 에러 등)
        socket.on("error", (error: any) => {
            console.error(
                `Socket-Server: Error on socket ${socket.id}:`,
                error
            );
        });
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket server running on port ${port}`);
    });
});
