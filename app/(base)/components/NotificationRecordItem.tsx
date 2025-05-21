"use client";

import React from "react";
import Image from "next/image";
import styles from "./MessageItem.module.scss";

import { useAuthStore } from "@/stores/AuthStore";

import { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type NotificationRecordItemProps = {
    notificationRecordDto: NotificationRecordDto;
};

export default function NotificationRecordItem(
    props: NotificationRecordItemProps
) {
    const { user } = useAuthStore();
    const memberId: string = user?.id || "";

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
        await fetch(`api/members/notifications/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${token}`
            },
        });
    };

    return (
        <div className="w-full flex flex-col justify-center items-start p-3 gap-3 border border-gray-300">
            <nav className="w-full flex flex-row items-center justify-between whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <Image
                        src={notificationRecordDto.typeImageUrl}
                        alt="타입 이미지"
                        width={50}
                        height={50}
                        className="w-[50px] h-[50px] object-cover rounded-full border border-gray-300"
                    />
                    <div className="flex flex-col justify-center">
                        <div className="text-lg font-semibold">
                            {notificationRecordDto.typeName}
                        </div>
                        <div className="text-md text-gray-500">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                <button
                    className="text-md text-gray-500 hover:text-black hover:font-semibold transition-colors duration-200"
                    onClick={async () =>
                        await handleDelete(notificationRecordDto.id)
                    }
                >
                    삭제
                </button>
            </nav>
            <div className="w-full p-3 break-words whitespace-pre-line text-md">
                {notificationRecordDto.description}
            </div>
        </div>
    );
}
