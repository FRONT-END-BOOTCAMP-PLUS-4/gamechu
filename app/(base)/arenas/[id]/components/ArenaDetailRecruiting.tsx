"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import useArenaStore from "@/stores/UseArenaStore";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
import Image from "next/image";

export default function ArenaDetailRecruiting() {
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, status: "success" as const, message: "" });
    const arenaDetail = useArenaStore((state) => state.arenaData);

    const { mutate: joinArena, isPending } = useMutation({
        mutationFn: async () => {
            const memberId = await getAuthUserId();
            if (!memberId) throw new Error("로그인이 필요합니다.");
            if (memberId === arenaDetail?.creatorId) {
                throw new Error("본인이 만든 투기장에는 참가할 수 없습니다.");
            }
            if (arenaDetail?.challengerId) {
                throw new Error("이미 다른 유저가 참가 중입니다.");
            }

            const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 2, challengerId: memberId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "상태 변경 실패");
            }
        },
        onSuccess: () => {
            setToast({ show: true, status: "success", message: "참가 요청이 접수되었습니다!" });
            setTimeout(() => window.location.reload(), 1500);
        },
        onError: (err) => {
            const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            setError(message);
        },
    });

    return (
        <div className="mt-6 flex min-h-[400px] w-full max-w-[1000px] animate-fade-in-up flex-col items-center justify-center rounded-3xl bg-background-300 px-6 py-12 text-center sm:min-h-[500px] sm:px-10 sm:py-20">
            <Toast show={toast.show} status={toast.status} message={toast.message} />
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
                        label={isPending ? "참가 처리 중..." : "도전하기"}
                        type="purple"
                        size="large"
                        onClick={() => joinArena()}
                        disabled={isPending}
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
