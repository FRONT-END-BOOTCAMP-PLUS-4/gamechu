import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { ArenaStatus } from "@/types/arena-status";
import { useEffect, useRef } from "react";

type Props = {
    arenaList: ArenaDetailDto[];
    onStatusUpdate?: (id: number, newStatus: ArenaStatus) => void;
};

export function useArenaAutoStatus({ arenaList, onStatusUpdate }: Props) {
    const timers = useRef<Record<number, NodeJS.Timeout>>({}); // arenaId -> timeout

    useEffect(() => {
        const now = Date.now();

        arenaList.forEach((arena) => {
            const {
                id,
                status,
                startDate,
                endChatting,
                endVote,
                challengerId,
            } = arena;

            if (timers.current[id]) return; // 중복 타이머 방지

            const schedule = (
                target: string,
                nextStatus: ArenaStatus,
                extraBody?: any
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
                    if (endChatting) {
                        schedule(endChatting, 4);
                    }
                    break;
                case 4:
                    if (endVote) {
                        schedule(endVote, 5);
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
        extraBody?: any
    ) => {
        try {
            const res = await fetch(`/api/arenas/${arenaId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, ...extraBody }),
            });
            if (!res.ok) throw new Error("상태 업데이트 실패");

            onStatusUpdate?.(arenaId, newStatus);
        } catch (err) {
            console.error(`아레나 ${arenaId} 상태 업데이트 실패:`, err);
        }
    };
}
