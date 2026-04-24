"use client";

import Image from "next/image";
import NotificationRecordItem from "./NotificationRecordItem";
import type { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type Props = {
    notificationRecords: NotificationRecordDto[];
};

export default function NotificationRecordList({ notificationRecords }: Props) {
    if (notificationRecords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background-200">
                    <Image
                        src="/icons/bell.svg"
                        alt=""
                        width={28}
                        height={28}
                        className="opacity-40"
                    />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-body font-medium text-font-200">
                        알림이 없어요
                    </span>
                    <span className="text-caption text-font-300">
                        새로운 알림이 생기면 여기에 표시됩니다.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <ol className="flex w-full list-none flex-col gap-1.5 p-0">
            {notificationRecords.map((record) => (
                <li key={record.id}>
                    <NotificationRecordItem notificationRecordDto={record} />
                </li>
            ))}
        </ol>
    );
}
