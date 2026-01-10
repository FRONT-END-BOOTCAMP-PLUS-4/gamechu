import React, { forwardRef } from "react";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import useArenaStore from "@/stores/useArenaStore";
import Image from "next/image";

interface ArenaChatListProps {
    chats: ChattingDto[];
}

function ArenaDetailChatListComponent(
    { chats }: ArenaChatListProps,
    ref: React.Ref<HTMLDivElement>
) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="custom-scroll mb-4 max-h-[550px] flex-1 overflow-y-auto pr-2">
            {chats.length === 0 ? (
                <p className="text-font-300 mt-4 text-center">
                    {arenaDetail?.status === 3
                        ? "채팅이 아직 없습니다. 토론을 시작해보세요!"
                        : "채팅이 없습니다."}
                </p>
            ) : (
                chats.map((chat, index) => {
                    const isCreator =
                        String(chat.memberId) ===
                        String(arenaDetail?.creatorId);
                    const isChallenger =
                        String(chat.memberId) ===
                        String(arenaDetail?.challengerId);

                    // 이전 채팅과 같은 사람이 보냈는지 확인
                    const isSameAsPrevious =
                        index > 0 &&
                        String(chats[index - 1].memberId) ===
                            String(chat.memberId);

                    return (
                        <div
                            key={chat.id}
                            className={`flex w-full animate-fade-in-up ${
                                isCreator
                                    ? "justify-start"
                                    : isChallenger
                                      ? "justify-end"
                                      : ""
                            } ${isSameAsPrevious ? "mt-1" : "mt-4"}`} // 연속 메시지면 간격을 좁게(mt-1)
                        >
                            <div className="flex max-w-[75%] flex-col gap-1">
                                {/* 닉네임 + 팀 SVG */}
                                {!isSameAsPrevious &&
                                    (isCreator || isChallenger) && (
                                        <div
                                            className={`flex items-center gap-2 ${
                                                isCreator
                                                    ? "justify-start"
                                                    : "justify-end"
                                            }`}
                                        >
                                            {isCreator && (
                                                <Image
                                                    src="/icons/teamA.svg"
                                                    alt="Team A"
                                                    width={32}
                                                    height={32}
                                                />
                                            )}
                                            <span className="text-xs font-bold text-font-200">
                                                {isCreator
                                                    ? arenaDetail?.creatorName
                                                    : arenaDetail?.challengerName}
                                            </span>
                                            {isChallenger && (
                                                <Image
                                                    src="/icons/teamB.svg"
                                                    alt="Team B"
                                                    width={32}
                                                    height={32}
                                                />
                                            )}
                                        </div>
                                    )}

                                {/* 채팅 내용 */}
                                <div
                                    className={`flex items-end gap-2 ${isCreator ? "flex-row" : "flex-row-reverse"}`}
                                >
                                    {/* 말풍선 */}
                                    <div
                                        className={`whitespace-pre-line rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                                            isCreator
                                                ? `bg-primary-purple-400 text-white ${!isSameAsPrevious ? "rounded-tl-none" : ""}`
                                                : isChallenger
                                                  ? `bg-primary-blue-400 text-white ${!isSameAsPrevious ? "rounded-tr-none" : ""}`
                                                  : "bg-gray-300"
                                        } ${isCreator ? "ml-10" : isChallenger ? "mr-10" : ""}`}
                                    >
                                        {chat.content}
                                    </div>

                                    {/* 시간 표시 */}
                                    <span className="text-font-300 mb-1 shrink-0 text-[10px]">
                                        {new Date(
                                            chat.createdAt
                                        ).toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={ref} />
        </div>
    );
}

const ArenaDetailChatList = forwardRef(ArenaDetailChatListComponent);

ArenaDetailChatList.displayName = "ArenaDetailChatList";

export default ArenaDetailChatList;
