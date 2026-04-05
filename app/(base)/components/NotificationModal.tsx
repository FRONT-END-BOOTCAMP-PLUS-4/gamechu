// app/(base)/components/NotificationModal.tsx
"use client";

import React, { useState } from "react";
import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/ModalStore";
import Pager from "@/app/components/Pager";
import NotificationRecordList from "./NotificationRecordList";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationModal() {
    const { isOpen, closeModal } = useModalStore();
    const [currentPage, setCurrentPage] = useState(1);
    const { data } = useNotifications(currentPage);

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={closeModal}
            labelId="notification-modal-title"
        >
            <div className="w-[480px] max-h-[80vh] flex flex-col gap-4">
                <h2
                    id="notification-modal-title"
                    className="sr-only"
                >
                    알림
                </h2>
                {data && (
                    <div>
                        <NotificationRecordList
                            notificationRecords={data.records}
                        />
                        {data.records.length > 0 && (
                            <Pager
                                currentPage={data.currentPage}
                                pages={data.pages}
                                endPage={data.endPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}
