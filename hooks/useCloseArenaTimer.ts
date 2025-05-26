import useArenaStore from "@/stores/useArenaStore";
import { useEffect } from "react";

interface UseArenaVoteEndTimerProps {
    onStatusUpdate?: (newStatus: number) => void;
}

export function useCloseArenaTimer({
    onStatusUpdate,
}: UseArenaVoteEndTimerProps) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    useEffect(() => {
        if (arenaDetail?.status !== 4 || !arenaDetail?.endVote) return;

        const endTime = new Date(arenaDetail.endVote).getTime();
        const now = Date.now();
        const msUntilEnd = endTime - now;

        if (msUntilEnd <= 0) {
            updateToStatus5();
            return;
        }

        const timer = setTimeout(() => {
            updateToStatus5();
        }, msUntilEnd);

        return () => clearTimeout(timer);

        async function updateToStatus5() {
            try {
                const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: 5 }),
                });

                if (!res.ok) throw new Error("상태 변경 실패");

                onStatusUpdate?.(5);
            } catch (err) {
                console.error("투표 종료 상태 업데이트 실패:", err);
            }
        }
    }, [
        arenaDetail?.id,
        arenaDetail?.status,
        arenaDetail?.endVote,
        onStatusUpdate,
    ]);
}
