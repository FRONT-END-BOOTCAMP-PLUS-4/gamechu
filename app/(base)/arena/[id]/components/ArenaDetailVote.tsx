"use client";

import Button from "@/app/components/Button";
import VoteStatusBar from "../../components/VoteStatusBar";

interface ArenaVoteProps {
    leftVotes: number;
    rightVotes: number;
}

export default function ArenaDetailVote({
    leftVotes,
    rightVotes,
}: ArenaVoteProps) {
    // 투표 합계
    const totalVotes = leftVotes + rightVotes;

    // 퍼센트 계산 (투표가 없으면 0으로 처리)
    const leftPercent = (leftVotes / totalVotes) * 100;
    const rightPercent = (rightVotes / totalVotes) * 100;

    // 투표 상태가 아닌 경우 렌더링 안 함
    // if (status !== "voting" && status !== "closed") return null;

    return (
        <div className="w-full max-w-[1000px] mt-6 bg-background-300 rounded-xl px-6 py-4 flex flex-col items-center justify-center gap-4 min-h-[200px] animate-fade-in-up">
            {/* 상단 투표 영역 */}
            <div className="w-full flex items-center justify-between">
                {/* A 유저 */}
                <div className="flex items-center gap-2 text-center">
                    {"voting" === "voting" ? ( //todo: status가 4일때로
                        <Button label="투표" type="purple" />
                    ) : (
                        <div className="w-24 text-font-100 font-bold">
                            {Math.round(leftPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        <img
                            src="/icons/teamA.svg"
                            alt="게시자 아이콘"
                            className="w-10 h-10"
                        />
                        게시자닉네임(티어)
                    </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-background-200 flex items-center justify-center text-white font-bold">
                    VS
                </div>

                {/* B 유저 */}
                <div className="flex items-center gap-2 flex-row-reverse">
                    {"voting" === "voting" ? (
                        <Button label="투표" type="blue" />
                    ) : (
                        <div className="w-24 text-font-100 font-bold text-center">
                            {Math.round(rightPercent)}%
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-font-100 text-body">
                        게시자닉네임(티어)
                        <img
                            src="/icons/teamB.svg"
                            alt="게시자 아이콘"
                            className="w-10 h-10"
                        />
                    </div>
                </div>
            </div>

            {/* 게이지 바 (투표 종료 시만 보임) */}
            {"closed" === "closed" && ( //todo: status가 5일때로 변경해야함
                <VoteStatusBar leftPercent={leftPercent} />
            )}

            {/* 하단 상태 메시지 */}
            <div className="text-font-100 text-caption">
                {"voting" === "voting" ? ( //todo: status가 4일때로 변경해야함
                    <>
                        투표가 진행중입니다. 남은시간 :{" "}
                        <span className="font-bold">12h 23m</span>
                    </>
                ) : (
                    <>투표가 종료되었습니다.</>
                )}
            </div>
        </div>
    );
}
