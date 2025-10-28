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
        <div className="custom-scroll mb-4 max-h-[550px] flex-1 space-y-3 overflow-y-auto pr-2">
            {chats.length === 0 ? (
                <p className="text-font-300 mt-4 text-center">
                    {arenaDetail?.status === 3
                        ? "채팅이 아직 없습니다. 토론을 시작해보세요!"
                        : "채팅이 없습니다."}
                </p>
            ) : (
                chats.map((chat) => {
                    const isCreator =
                        String(chat.memberId) ===
                        String(arenaDetail?.creatorId);
                    const isChallenger =
                        String(chat.memberId) ===
                        String(arenaDetail?.challengerId);
                    return (
                        <div
                            key={chat.id}
                            className={`flex ${
                                isCreator
                                    ? "justify-start"
                                    : isChallenger
                                      ? "justify-end"
                                      : ""
                            }`}
                        >
                            <div className="flex max-w-[75%] flex-col gap-1">
                                {/* 닉네임 + 팀 SVG */}
                                {(isCreator || isChallenger) && (
                                    <div
                                        className={`flex items-center gap-2 ${isCreator ? "justify-start" : "justify-end"}`}
                                    >
                                        {isCreator && (
                                            <Image
                                                src="/icons/teamA.svg"
                                                alt="Team A"
                                                width={32}
                                                height={32}
                                            />
                                        )}
                                        <span className="text-font-300 text-xs">
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
                                    className={`rounded-lg px-4 py-2 text-sm ${
                                        isCreator
                                            ? "ml-10 bg-primary-purple-400 text-white"
                                            : isChallenger
                                              ? "mr-10 bg-primary-blue-400 text-white"
                                              : "bg-gray-300"
                                    }`}
                                >
                                    <div>{chat.content}</div>
                                    <div className="mt-1 text-right text-[10px] text-gray-200">
                                        {new Date(
                                            chat.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
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
