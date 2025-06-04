import { ArenaDto } from "@/backend/arena/application/usecase/dto/ArenaDto";
import { ArenaStatus } from "@/types/arena-status";
import { useEffect, useRef } from "react";

type Props = {
    arenaList: ArenaDto[];
    onStatusUpdate?: (id: number, newStatus: ArenaStatus) => void;
};
type ExtraBody = Record<string, unknown>;

export function useArenaAutoStatus({ arenaList, onStatusUpdate }: Props) {
    const timers = useRef<Record<number, NodeJS.Timeout>>({}); // arenaId -> timeout

    useEffect(() => {
        const now = new Date().getTime();

        arenaList.forEach((arena) => {
            const {
                id,
                status,
                startDate,
                debateEndDate,
                voteEndDate,
                challengerId,
            } = arena;

            if (timers.current[id]) return; // 중복 타이머 방지

            const schedule = (
                target: Date,
                nextStatus: ArenaStatus,
                extraBody?: ExtraBody
            ) => {
                const delay = new Date(target).getTime() - now;
                if (delay <= 0) {
                    updateStatus(id, nextStatus, extraBody);
                    return;
                }
                timers.current[id] = setTimeout(() => {
                    updateStatus(id, nextStatus, extraBody);
                }, delay);
            };

            switch (status) {
                case 2:
                    if (startDate) {
                        const nextStatus = challengerId ? 3 : 5;
                        schedule(startDate, nextStatus, { challengerId });
                    }
                    break;
                case 3:
                    if (debateEndDate) {
                        schedule(debateEndDate, 4);
                    }
                    break;
                case 4:
                    if (voteEndDate) {
                        schedule(voteEndDate, 5);
                    }
                    break;
            }
        });

        return () => {
            Object.values(timers.current).forEach(clearTimeout);
            timers.current = {};
        };
    }, [arenaList]);

    const updateStatus = async (
        arenaId: number,
        newStatus: ArenaStatus,
        extraBody?: ExtraBody
    ) => {
        try {
            const res = await fetch(`/api/arenas/${arenaId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, ...extraBody }),
            });
            if (!res.ok) throw new Error("상태 업데이트 실패");
            if (newStatus === 5) {
                await fetch(`/api/arenas/${arenaId}/end`, { method: "POST" });
            }
            onStatusUpdate?.(arenaId, newStatus);
        } catch (err) {
            console.error(`아레나 ${arenaId} 상태 업데이트 실패:`, err);
        }
    };
}
