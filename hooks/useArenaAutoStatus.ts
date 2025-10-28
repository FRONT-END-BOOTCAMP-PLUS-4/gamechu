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

type ExtraBody = Record<string, unknown>;

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
                nextStatus: ArenaStatus,
                extraBody?: ExtraBody
            ) => {
                // 1) 현재 시간 KST 기준
                const nowKST = dayjs().utcOffset(9 * 60);
                // 2) targetUTC 문자열 → dayjs UTC 파싱
                const targetUTCDate = dayjs.utc(targetUTC);
                // 3) targetUTC → KST 시간으로 변환
                const targetKST = targetUTCDate.add(9, "hour");
                // 4) 딜레이 계산 (밀리초)
                const delay = targetKST.valueOf() - nowKST.valueOf();
                if (delay <= 0) {
                    updateStatus(id, nextStatus, extraBody);
                    return;
                }

                timers.current[id] = setTimeout(() => {
                    updateStatus(id, nextStatus, extraBody);
                }, delay);
            };

            switch (status) {
                case 1: {
                    if (startDate && !challengerId) {
                        schedule(startDate, 5);
                    }
                    break;
                }
                case 2:
                    if (startDate) {
                        const nextStatus = challengerId ? 3 : 5;
                        schedule(startDate, nextStatus, { challengerId });
                    }
                    break;
                case 3:
                    if (debateEndDate) schedule(debateEndDate, 4);
                    break;
                case 4:
                    if (voteEndDate) schedule(voteEndDate, 5);
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
