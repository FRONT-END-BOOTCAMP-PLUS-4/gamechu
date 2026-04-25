"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/ModalStore";
import Pager from "@/app/components/Pager";
import NotificationRecordList from "./NotificationRecordList";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationCount } from "@/hooks/useNotificationCount";

export default function NotificationModal() {
    const { isOpen, closeModal } = useModalStore();
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isLoading } = useNotifications(currentPage);
    const { data: countData } = useNotificationCount();
    const unreadCount = countData?.count ?? 0;

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={closeModal}
            labelId="notification-modal-title"
            dialogClassName="max-w-[460px]"
        >
            <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                        <h2
                            id="notification-modal-title"
                            className="text-h3 font-bold text-font-100"
                        >
                            알림
                        </h2>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-purple-200 px-1.5 text-caption font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={closeModal}
                        className="rounded-lg p-1.5 text-font-200 transition-colors hover:bg-white/10 hover:text-font-100"
                        aria-label="알림 닫기"
                    >
                        <X size={18} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-1.5 py-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-[72px] w-full animate-pulse rounded-lg bg-background-200"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <NotificationRecordList
                            notificationRecords={data?.records ?? []}
                        />
                        {data && data.endPage > 1 && (
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
