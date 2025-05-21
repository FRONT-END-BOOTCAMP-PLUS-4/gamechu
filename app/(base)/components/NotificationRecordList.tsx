"use client";
import React from "react";
import Image from "next/image";
import NotificationRecordItem from "./NotificationRecordItem";
import { NotificationRecordDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordDto";

type NotificationRecordListProps = {
    notificationRecords: NotificationRecordDto[];
};

export default function NotificationRecordList(
    props: NotificationRecordListProps
) {
    return (
        <div className="w-full flex flex-col justify-center items-center gap-9">
            <ol className="w-full flex flex-col gap-6 p-0 m-0 list-none">
                {props.notificationRecords.length === 0 ? (
                    <li className="w-full flex flex-col justify-center items-center text-center gap-4 text-font-200 text-body font-regular">
                        <Image
                            src="/images/NotificationEmpty.png"
                            alt="새 알림 없음 이미지"
                            width={200}
                            height={200}
                            className="-order-1"
                            priority={true}
                        />
                        새로운 알림이 없어요.
                    </li>
                ) : (
                    props.notificationRecords.map(
                        (record: NotificationRecordDto) => (
                            <li key={record.id}>
                                <NotificationRecordItem
                                    notificationRecordDto={record}
                                />
                            </li>
                        )
                    )
                )}
            </ol>
        </div>
    );
}
