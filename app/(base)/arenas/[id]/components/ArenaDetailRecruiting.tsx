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
                console.error("Catch된 알 수 없는 타입의 에러:", err);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 min-h-[740px] w-full max-w-[1000px] animate-fade-in-up rounded-lg bg-background-300 px-4 py-6 text-center text-font-200">
            <h2 className="mb-2 animate-pulse text-lg">
                도전 상대를 모집 중입니다.
            </h2>
            <p className="text-md mb-2 animate-pulse">도전해보세요!</p>
            <div className="mx-auto my-4 w-fit animate-bounce">
                <Image
                    src="/icons/arrowDown.svg"
                    alt="아래 화살표"
                    width={24}
                    height={24}
                />
            </div>
            <Button
                label="참가하기"
                type="purple"
                size="large"
                onClick={handleJoin}
                disabled={loading}
            />
            {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
    );
}
