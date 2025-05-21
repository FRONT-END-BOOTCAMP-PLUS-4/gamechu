"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import React, { useEffect, useState } from "react";
import Pager from "@/app/components/Pager";
import { NotificationRecordListDto } from "@/backend/notification-record/application/usecase/dto/NotificationRecordListDto";
import NotificationRecordList from "./NotificationRecordList";

type NotificationModalProps = {
    notificationRecordListDto: NotificationRecordListDto;
};

export default function NotificationModal(props: NotificationModalProps) {
    const { isOpen, closeModal } = useModalStore();

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <div className="w-[480px] max-h-[80vh] flex flex-col gap-4">
                <NotificationRecordList
                    notificationRecords={
                        props.notificationRecordListDto.records
                    }
                />
                <Pager
                    currentPage={props.notificationRecordListDto.currentPage}
                    pages={props.notificationRecordListDto.pages}
                    endPage={props.notificationRecordListDto.endPage}
                    onPageChange={(newPage: number) =>
                        (props.notificationRecordListDto.currentPage = newPage)
                    }
                />
            </div>
        </ModalWrapper>
    );
}
