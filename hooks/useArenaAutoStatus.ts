import { ArenaDto } from "@/backend/arena/application/usecase/dto/ArenaDto";
import { ArenaStatus } from "@/types/arena-status";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useRef } from "react";

dayjs.extend(utc);

type Props = {
    arenaList: ArenaDto[];
    onStatusUpdate?: (id: number, newStatus: ArenaStatus) => void;
};

export function useArenaAutoStatus({ arenaList, onStatusUpdate }: Props) {
    const timers = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
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
                targetUTC: string | Date,
                newStatus: ArenaStatus | "delete"
            ) => {
                if (!targetUTC) return;

                const now = dayjs();
                const targetTime = dayjs(targetUTC).utcOffset(9 * 60);
                const delay = targetTime.diff(now);

                const run = async () => {
                    try {
                        if (newStatus === "delete") await deleteArena(id);
                        else await updateStatus(id, newStatus);
                    } catch (err) {
                        console.error(err);
                    }
                };

                if (delay <= 0) {
                    run();
                } else {
                    timers.current[id] = setTimeout(run, delay);
                }
            };
            switch (status) {
                case 1: {
                    if (startDate && !challengerId) {
                        schedule(startDate, "delete");
                    }
                    break;
                }
                case 2:
                    schedule(startDate, 3);
                    break;
                case 3:
                    schedule(debateEndDate, 4);
                    break;
                case 4:
                    schedule(voteEndDate, 5);
                    break;
            }
        });

        // cleanup: 언마운트 시 모든 타이머 제거
        return () => {
            Object.values(timers.current).forEach(clearTimeout);
            timers.current = {};
        };
    }, [arenaList]);

    // 아레나 삭제
    const deleteArena = async (arenaId: number) => {
        try {
            const res = await fetch(`/api/arenas/${arenaId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("아레나 삭제 실패");
            onStatusUpdate?.(arenaId, 0 as ArenaStatus);
        } catch (err) {
            console.error(`아레나 ${arenaId} 삭제 실패:`, err);
        }
    };

    // 아레나 상태 업데이트
    const updateStatus = async (arenaId: number, newStatus: ArenaStatus) => {
        try {
            const res = await fetch(`/api/arenas/${arenaId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
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
