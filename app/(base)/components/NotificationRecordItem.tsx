"use client";

import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/TailwindUtil";
import { queryKeys } from "@/lib/QueryKeys";
import type { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type Props = {
    notificationRecordDto: NotificationRecordDto;
};

function getRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function NotificationRecordItem({ notificationRecordDto }: Props) {
    const queryClient = useQueryClient();

    const { mutate: markRead, isPending: isMarking } = useMutation({
        mutationFn: () =>
            fetch(`/api/member/notification-records/${notificationRecordDto.id}`, {
                method: "PATCH",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount() });
        },
    });

    const { mutate: deleteNotification, isPending: isDeleting } = useMutation({
        mutationFn: (id: number) =>
            fetch(`/api/member/notification-records/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount() });
        },
    });

    const isPending = isMarking || isDeleting;
    const createdAt = new Date(notificationRecordDto.createdAt);

    return (
        <div
            className={cn(
                "relative flex items-start gap-3 rounded-lg border-l-2 bg-background-200 p-3 transition-opacity",
                notificationRecordDto.isRead
                    ? "border-transparent opacity-60"
                    : "border-primary-purple-200",
                !notificationRecordDto.isRead &&
                    !isPending &&
                    "cursor-pointer hover:bg-background-200/80",
                isPending && "pointer-events-none opacity-40"
            )}
            onClick={() => {
                if (!notificationRecordDto.isRead && !isPending) markRead();
            }}
        >
            <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-background-300 p-1.5">
                <Image
                    src={notificationRecordDto.typeImageUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="h-full w-full object-contain"
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-button font-semibold text-font-100">
                        {notificationRecordDto.typeName}
                    </span>
                    {!notificationRecordDto.isRead && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-purple-200" />
                    )}
                </div>
                <span className="truncate text-caption text-font-200">
                    {notificationRecordDto.description}
                </span>
                <span className="mt-0.5 text-caption text-font-300">
                    {getRelativeTime(createdAt)}
                </span>
            </div>

            <button
                className="shrink-0 rounded p-1 text-font-300 transition-colors hover:bg-white/10 hover:text-font-100 disabled:opacity-40"
                aria-label="알림 삭제"
                disabled={isPending}
                onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notificationRecordDto.id);
                }}
            >
                <Image src="/icons/delete.svg" alt="" width={16} height={16} />
            </button>
        </div>
    );
}
