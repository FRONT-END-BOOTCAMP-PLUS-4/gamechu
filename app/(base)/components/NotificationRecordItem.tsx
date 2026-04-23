"use client";

import React from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/QueryKeys";
import { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type NotificationRecordItemProps = {
    notificationRecordDto: NotificationRecordDto;
    href?: string;
};

export default function NotificationRecordItem(
    props: NotificationRecordItemProps
) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const notificationRecordDto: NotificationRecordDto =
        props.notificationRecordDto;
    const createdAt = new Date(notificationRecordDto.createdAt);
    const pad = (str: string) => str.toString().padStart(2, "0");
    const formattedDate = `${createdAt.getFullYear()}-${pad(
        String(createdAt.getMonth() + 1)
    )}-${pad(String(createdAt.getDate()))} ${pad(
        String(createdAt.getHours())
    )}:${pad(String(createdAt.getMinutes()))}`;

    const { mutate: markRead } = useMutation({
        mutationFn: () =>
            fetch(`/api/member/notification-records/${notificationRecordDto.id}`, {
                method: "PATCH",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount() });
            router.push(props.href ?? "#");
        },
    });

    const { mutate: deleteNotification } = useMutation({
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

    const handleClick = () => {
        const href = props.href ?? "#";
        if (!notificationRecordDto.isRead) {
            markRead();
        } else {
            router.push(href);
        }
    };

    return (
        <div
            className="relative w-full cursor-pointer rounded-lg bg-background-300 p-2.5 transition-colors hover:outline hover:outline-1 hover:outline-primary-purple-200"
            style={{ opacity: notificationRecordDto.isRead ? 0.6 : 1 }}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1 h-6 min-h-[24px] w-6 min-w-[24px]">
                        <Image
                            src={notificationRecordDto.typeImageUrl}
                            alt="알림 아이콘"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                    </div>

                    <div className="flex flex-col gap-1 text-font-100">
                        <span className="text-body font-semibold">
                            {notificationRecordDto.typeName}
                        </span>
                        <span className="font-small text-caption text-font-200">
                            {notificationRecordDto.description}
                        </span>
                    </div>
                </div>

                <div className="flex min-w-max flex-col items-end justify-center gap-2 text-caption text-font-200">
                    <span>{formattedDate}</span>
                    <button
                        className="hover:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notificationRecordDto.id);
                        }}
                    >
                        <Image
                            src="/icons/delete.svg"
                            alt="삭제"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
