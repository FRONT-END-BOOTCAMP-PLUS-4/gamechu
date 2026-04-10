"use client";

import React from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/QueryKeys";

import { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type NotificationRecordItemProps = {
    notificationRecordDto: NotificationRecordDto;
};

export default function NotificationRecordItem(
    props: NotificationRecordItemProps
) {
    const queryClient = useQueryClient();
    const notificationRecordDto: NotificationRecordDto =
        props.notificationRecordDto;
    const createdAt = new Date(notificationRecordDto.createdAt);
    const pad = (str: string) => str.toString().padStart(2, "0");
    const formattedDate = `${createdAt.getFullYear()}-${pad(
        String(createdAt.getMonth() + 1)
    )}-${pad(String(createdAt.getDate()))} ${pad(
        String(createdAt.getHours())
    )}:${pad(String(createdAt.getMinutes()))}`;

    const { mutate: deleteNotification } = useMutation({
        mutationFn: (id: number) =>
            fetch(`/api/member/notification-records/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications(1),
            });
        },
    });

    return (
        <div className="relative w-full rounded-lg bg-background-300 p-2.5 transition-colors hover:outline hover:outline-1 hover:outline-primary-purple-200">
            {/* 메시지와 우측 정보 영역을 flex로 정렬 */}
            <div className="flex items-start justify-between gap-4">
                {/* 왼쪽: 아이콘 + 메시지 */}
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

                {/* 오른쪽: 날짜 + 삭제 버튼 (중앙 정렬) */}
                <div className="flex min-w-max flex-col items-end justify-center gap-2 text-caption text-font-200">
                    <span>{formattedDate}</span>
                    <button
                        className="hover:text-white"
                        onClick={() =>
                            deleteNotification(notificationRecordDto.id)
                        }
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
