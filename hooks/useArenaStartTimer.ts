import { useEffect } from "react";

interface UseArenaStartTimerProps {
    arenaId: number;
    status: number;
    startAt: string;
    challengerId: string | null;
    onStatusUpdate?: (newStatus: number) => void;
}

export function useArenaStartTimer({
    arenaId,
    status,
    startAt,
    challengerId,
    onStatusUpdate,
}: UseArenaStartTimerProps) {
    useEffect(() => {
        if (status !== 2 || !startAt) return;

        const handleStart = async () => {
            const newStatus = challengerId ? 3 : 5;
            console.log("여기서도 떠야됨: ", challengerId);
            try {
                const res = await fetch(`/api/arenas/${arenaId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus, challengerId }),
                });

                if (!res.ok) throw new Error("상태 변경 실패");

                onStatusUpdate?.(newStatus);
            } catch (err) {
                console.error("투기장 상태 업데이트 실패:", err);
            }
        };

        const now = new Date();
        const startTime = new Date(startAt);
        const msUntilStart = startTime.getTime() - now.getTime();

        if (msUntilStart <= 0) {
            handleStart();
            return;
        }

        const timer = setTimeout(() => {
            handleStart();
        }, msUntilStart);

        return () => clearTimeout(timer);
    }, [arenaId, status, startAt, challengerId, onStatusUpdate]);
}
