import useArenaStore from "@/stores/useArenaStore";
import { useEffect } from "react";

interface UseArenaStartTimerProps {
    onStatusUpdate?: (newStatus: number) => void;
}

export function useArenaStartTimer({
    onStatusUpdate,
}: UseArenaStartTimerProps) {
    const arenaDetail = useArenaStore((state) => state.arenaData);
    useEffect(() => {
        if (arenaDetail?.status !== 2 || !arenaDetail?.startDate) return;

        const handleStart = async () => {
            const newStatus = arenaDetail.challengerId ? 3 : 5;
            console.log("여기서도 떠야됨: ", arenaDetail.challengerId);
            try {
                const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: newStatus,
                        challengerId: arenaDetail?.challengerId,
                    }),
                });

                if (!res.ok) throw new Error("상태 변경 실패");

                onStatusUpdate?.(newStatus);
            } catch (err) {
                console.error("투기장 상태 업데이트 실패:", err);
            }
        };

        const now = new Date();
        const startTime = new Date(arenaDetail.startDate);
        const msUntilStart = startTime.getTime() - now.getTime();

        if (msUntilStart <= 0) {
            handleStart();
            return;
        }

        const timer = setTimeout(() => {
            handleStart();
        }, msUntilStart);

        return () => clearTimeout(timer);
    }, [
        arenaDetail?.id,
        arenaDetail?.status,
        arenaDetail?.startDate,
        arenaDetail?.challengerId,
        onStatusUpdate,
    ]);
}
