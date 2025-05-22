"use client";
import Button from "@/app/components/Button";
import useArenaStore from "@/stores/useArenaStore";
import { getAuthUserId } from "@/utils/GetAuthUserId.client";
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
        <div className="w-full max-w-[1000px] px-4 py-6 mt-6 text-center text-font-200 bg-background-300 rounded-lg min-h-[740px] animate-fade-in-up">
            <h2 className="text-lg mb-2 animate-pulse">
                도전 상대를 모집 중입니다.
            </h2>
            <p className="text-md mb-2 animate-pulse">도전해보세요!</p>
            <div className="animate-bounce w-fit mx-auto my-4">
                <img
                    src="/icons/arrowDown.svg"
                    alt="아래 화살표"
                    className="w-6 h-6"
                />
            </div>
            <Button
                label="참가하기"
                type="purple"
                size="large"
                onClick={handleJoin}
                disabled={loading}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
