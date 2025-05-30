"use client";

import React from "react";
import Image from "next/image";

import { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type NotificationRecordItemProps = {
    notificationRecordDto: NotificationRecordDto;
};

export default function NotificationRecordItem(
    props: NotificationRecordItemProps
) {
    const notificationRecordDto: NotificationRecordDto =
        props.notificationRecordDto;
    const createdAt = new Date(notificationRecordDto.createdAt);
    const pad = (str: string) => str.toString().padStart(2, "0");
    const formattedDate = `${createdAt.getFullYear()}-${pad(
        String(createdAt.getMonth() + 1)
    )}-${pad(String(createdAt.getDate()))} ${pad(
        String(createdAt.getHours())
    )}:${pad(String(createdAt.getMinutes()))}`;

    const handleDelete = async (id: number) => {
        await fetch(`api/member/notifications/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${token}`
            },
        });
    };

    return (
        <div className="relative w-full p-2.5 rounded-lg bg-background-300 hover:outline hover:outline-1 hover:outline-primary-purple-200 transition-colors">
            {/* 메시지와 우측 정보 영역을 flex로 정렬 */}
            <div className="flex justify-between items-start gap-4">
                {/* 왼쪽: 아이콘 + 메시지 */}
                <div className="flex gap-4 items-start">
                    <div className="w-6 h-6 min-w-[24px] min-h-[24px] mt-1">
                        <Image
                            src={notificationRecordDto.typeImageUrl}
                            alt="알림 아이콘"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                    </div>

                    <div className="flex flex-col gap-1 text-font-100">
                        <span className="font-semibold text-body">
                            {notificationRecordDto.typeName}
                        </span>
                        <span className="font-small text-font-200 text-caption">
                            {notificationRecordDto.description}
                        </span>
                    </div>
                </div>

                {/* 오른쪽: 날짜 + 삭제 버튼 (중앙 정렬) */}
                <div className="flex flex-col items-end justify-center text-font-200 text-caption gap-2 min-w-max">
                    <span>{formattedDate}</span>
                    <button
                        className="hover:text-white"
                        onClick={() => handleDelete(notificationRecordDto.id)}
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
