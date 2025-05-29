"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import React, { useEffect, useState } from "react";
import Pager from "@/app/components/Pager";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";
import NotificationRecordList from "./NotificationRecordList";

export default function NotificationModal() {
    const { isOpen, closeModal } = useModalStore();
    const [notificationRecordListDto, setNotificationRecordListDto] =
        useState<NotificationRecordListDto>();

    useEffect(() => {
        const fetchNotificationRecords = async () => {
            try {
                const params = new URLSearchParams();

                const res = await fetch(
                    `/api/member/notifications?${params.toString()}`,
                    { method: "GET" }
                );
                const data = await res.json();
                setNotificationRecordListDto(data);
            } catch (error: unknown) {
                console.error("Failed to fetch notification records", error);
            }
        };

        fetchNotificationRecords();
    }, []);

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <div className="w-[480px] max-h-[80vh] flex flex-col gap-4">
                {notificationRecordListDto && (
                    <>
                        <NotificationRecordList
                            notificationRecords={
                                notificationRecordListDto.records
                            }
                        />
                        <Pager
                            currentPage={notificationRecordListDto.currentPage}
                            pages={notificationRecordListDto.pages}
                            endPage={notificationRecordListDto.endPage}
                            onPageChange={(newPage: number) =>
                                (notificationRecordListDto.currentPage =
                                    newPage)
                            }
                        />
                    </>
                )}
            </div>
        </ModalWrapper>
    );
}
