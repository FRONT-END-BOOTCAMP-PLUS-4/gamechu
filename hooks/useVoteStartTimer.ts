import useArenaStore from "@/stores/useArenaStore";
import { useEffect } from "react";

interface UseVoteStartTimerProps {
    onStatusUpdate?: (newStatus: number) => void;
}

export function useVoteStartTimer({ onStatusUpdate }: UseVoteStartTimerProps) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    useEffect(() => {
        if (arenaDetail?.status !== 3 || !arenaDetail?.endChatting) return;

        const endTime = new Date(arenaDetail.endChatting).getTime();
        const now = Date.now();
        const msUntilEnd = endTime - now;

        if (msUntilEnd <= 0) {
            updateToStatus4();
            return;
        }

        const timer = setTimeout(() => {
            updateToStatus4();
        }, msUntilEnd);

        return () => clearTimeout(timer);

        async function updateToStatus4() {
            try {
                const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: 4 }),
                });

                if (!res.ok) throw new Error("상태 변경 실패");

                onStatusUpdate?.(4);
            } catch (err) {
                console.error("채팅 종료 상태 업데이트 실패:", err);
            }
        }
    }, [
        arenaDetail?.id,
        arenaDetail?.status,
        arenaDetail?.endChatting,
        onStatusUpdate,
    ]);
}
