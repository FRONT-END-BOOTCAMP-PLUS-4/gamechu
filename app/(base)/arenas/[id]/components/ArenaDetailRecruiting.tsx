"use client";

import Button from "@/app/components/Button";
import useArenaStore from "@/stores/useArenaStore";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import Image from "next/image";
import { useState } from "react";

export default function ArenaDetailRecruiting() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const arenaDetail = useArenaStore((state) => state.arenaData);

    const handleJoin = async () => {
        setLoading(true);
        setError(null);
        try {
            const memberId = await getAuthUserId(); // 🔐 로그인된 유저 ID 가져오기
            if (!memberId) throw new Error("로그인이 필요합니다.");
            if (memberId === arenaDetail?.creatorId) {
                throw new Error("본인이 만든 투기장에는 참가할 수 없습니다.");
            }
            // 👇 이미 다른 도전자가 있을 경우
            if (arenaDetail?.challengerId) {
                throw new Error("이미 다른 유저가 참가 중입니다.");
            }

            const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: 2, // 상태 2로 변경
                    challengerId: memberId, // 👈 같이 보냄
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "상태 변경 실패");
            }

            alert("참가 요청이 접수되었습니다!");
            window.location.reload();
        } catch (err: unknown) {
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === "string") {
                errorMessage = err;
            } else {
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 flex min-h-[400px] w-full max-w-[1000px] animate-fade-in-up flex-col items-center justify-center rounded-3xl bg-background-300 px-6 py-12 text-center sm:min-h-[500px] sm:px-10 sm:py-20">
            <div className="relative mb-6 flex items-center justify-center">
                {/* 아이콘 */}
                <div className="relative flex h-24 w-24 animate-spin items-center justify-center rounded-full bg-background-400/50 ring-2 ring-primary-purple-200/40 [animation-duration:8s] sm:h-40 sm:w-40">
                    <Image
                        src="/icons/infotime.svg"
                        alt="시간 아이콘"
                        width={40}
                        height={40}
                        className="h-16 w-16 sm:h-28 sm:w-28"
                    />
                </div>
            </div>

            {/* 메인 텍스트 */}
            <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-black tracking-tight text-font-100 sm:text-4xl">
                    도전 상대를 모집 중입니다
                </h2>
                <p className="mx-auto max-w-[280px] text-xs font-medium leading-relaxed text-font-200 sm:max-w-none sm:text-base">
                    이 투기장의 주인이 당신의 도전을 기다리고 있습니다.
                    <br className="hidden sm:block" />
                    지금 참가하여 치열한 토론의 주인공이 되어보세요!
                </p>
            </div>

            {/* 화살표, 버튼 */}
            <div className="mt-6 flex flex-col items-center gap-6">
                <div className="animate-bounce">
                    <Image
                        src="/icons/arrowDown.svg"
                        alt="아래 화살표"
                        width={28}
                        height={28}
                    />
                </div>

                <div className="w-full transition-all hover:scale-105 active:scale-95">
                    <Button
                        label={loading ? "참가 처리 중..." : "도전하기"}
                        type="purple"
                        size="large"
                        onClick={handleJoin}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="mt-2 rounded-xl bg-red-400/10 px-5 py-3">
                        <p className="text-xs font-bold text-red-400 sm:text-sm">
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
