import useArenaStore from "@/stores/useArenaStore";
import { ArenaStatus } from "@/types/arena-status";
import dayjs from "dayjs";
import { useEffect } from "react";

export function useArenaAutoStatusDetail({
    onStatusUpdate,
}: {
    onStatusUpdate?: (newStatus: number) => void;
}) {
    const arenaDetail = useArenaStore((state) => state.arenaData);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const schedule = (
            targetUTC: Date,
            newStatus: ArenaStatus | "delete"
        ) => {
            const targetTime = dayjs(targetUTC);
            const delay = targetTime.diff(dayjs());

            const run = async () => {
                try {
                    if (newStatus === "delete") {
                        await deleteArena(arenaDetail!.id);
                    } else await updateStatus(newStatus);
                } catch (err) {
                    console.error(err);
                }
            };

            if (delay <= 0) {
                run();
                return;
            }
            timer = setTimeout(run, delay);
        };

        if (!arenaDetail?.id || !arenaDetail?.status) return;

        switch (arenaDetail.status) {
            case 1: {
                if (arenaDetail.startDate && !arenaDetail.challengerId) {
                    schedule(new Date(arenaDetail.startDate), "delete");
                }
                break;
            }
            case 2: {
                schedule(new Date(arenaDetail.startDate), 3);
                break;
            }
            case 3: {
                schedule(new Date(arenaDetail.endChatting), 4);
                break;
            }
            case 4: {
                schedule(new Date(arenaDetail.endVote), 5);
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

    // 아레나 삭제
    const deleteArena = async (arenaId: number) => {
        try {
            const res = await fetch(`/api/arenas/${arenaId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("아레나 삭제 실패");
            onStatusUpdate?.(0);
        } catch (err) {
            console.error(`아레나 ${arenaId} 삭제 실패:`, err);
        }
    };

    // 아레나 상태 업데이트
    const updateStatus = async (newStatus: ArenaStatus) => {
        try {
            const res = await fetch(`/api/arenas/${arenaDetail?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
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
}
