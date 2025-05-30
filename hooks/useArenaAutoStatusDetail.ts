import useArenaStore from "@/stores/useArenaStore";
import { useEffect } from "react";

type ExtraBody = {
    challengerId?: string | number | null;
};

export function useArenaAutoStatusDetail({
    onStatusUpdate,
}: {
    onStatusUpdate?: (newStatus: number) => void;
}) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const now = Date.now();

        const scheduleUpdate = (
            targetTime: Date,
            newStatus: number,
            extraBody?: ExtraBody
        ) => {
            const delay = targetTime.getTime() - now;
            if (delay <= 0) {
                updateStatus(newStatus, extraBody);
                return;
            }
            timer = setTimeout(() => {
                updateStatus(newStatus, extraBody);
            }, delay);
        };

        const updateStatus = async (
            newStatus: number,
            extraBody?: ExtraBody
        ) => {
            try {
                const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus, ...extraBody }),
                });
                if (!res.ok) throw new Error("상태 변경 실패");
                if (newStatus === 5) {
                    await fetch(`/api/arenas/${arenaDetail?.id}/end`, {
                        method: "POST",
                    });
                }
                onStatusUpdate?.(newStatus);
            } catch (err) {
                console.error("상태 자동 업데이트 실패:", err);
            }
        };

        if (!arenaDetail?.id || !arenaDetail?.status) return;

        switch (arenaDetail.status) {
            case 2: {
                if (!arenaDetail.startDate) return;
                const nextStatus = arenaDetail.challengerId ? 3 : 5;
                scheduleUpdate(new Date(arenaDetail.startDate), nextStatus, {
                    challengerId: arenaDetail.challengerId,
                });
                break;
            }
            case 3: {
                if (!arenaDetail.endChatting) return;
                scheduleUpdate(new Date(arenaDetail.endChatting), 4);
                break;
            }
            case 4: {
                if (!arenaDetail.endVote) return;
                scheduleUpdate(new Date(arenaDetail.endVote), 5);
                break;
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [
        arenaDetail?.id,
        arenaDetail?.status,
        arenaDetail?.startDate,
        arenaDetail?.endChatting,
        arenaDetail?.endVote,
        arenaDetail?.challengerId,
        onStatusUpdate,
    ]);
}
