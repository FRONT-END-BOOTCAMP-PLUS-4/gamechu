import React, { forwardRef } from "react";
import { ChattingDto } from "@/backend/chatting/application/usecase/dto/ChattingDto";
import useArenaStore from "@/stores/useArenaStore";

interface ArenaChatListProps {
    chats: ChattingDto[];
}

function ArenaDetailChatListComponent(
    { chats }: ArenaChatListProps,
    ref: React.Ref<HTMLDivElement>
) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    return (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 max-h-[550px] custom-scroll">
            {chats.length === 0 ? (
                <p className="text-font-300 text-center mt-4">
                    아직 채팅이 없습니다.
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
                            <div className="max-w-[70%]">
                                {/* 닉네임 + 팀 SVG */}
                                <div
                                    className={`flex items-center mb-1 gap-2 ${
                                        isCreator
                                            ? "justify-start"
                                            : isChallenger
                                            ? "justify-end"
                                            : ""
                                    }`}
                                >
                                    {isCreator && (
                                        <div className="flex flex-column items-center gap-4">
                                            <img
                                                src="/icons/teamA.svg"
                                                alt="Team A"
                                                className="w-8 h-8 mr-auto"
                                            />
                                            <span className="text-xs text-font-300">
                                                {arenaDetail?.creatorName}
                                            </span>
                                        </div>
                                    )}
                                    {isChallenger && (
                                        <div className="flex items-center mb-1 gap-2">
                                            <span className="text-xs text-font-300">
                                                {arenaDetail?.challengerName}
                                            </span>
                                            <img
                                                src="/icons/teamB.svg"
                                                alt="Team B"
                                                className="w-8 h-8 ml-auto"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 채팅 내용 */}
                                <div
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                        isCreator
                                            ? "bg-primary-purple-400 text-white ml-10"
                                            : isChallenger
                                            ? "bg-primary-blue-400 text-white mr-10"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <div>{chat.content}</div>
                                    <div className="text-[10px] text-gray-200 text-right mt-1">
                                        {new Date(
                                            chat.createdAt
                                        ).toLocaleTimeString()}
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
