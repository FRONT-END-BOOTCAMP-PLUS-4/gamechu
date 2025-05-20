"use client";

import useModalStore from "@/stores/modalStore";
import NotificationModal from "@/app/(base)/components/NotificationModal";

export default function Modals() {
    const { modalType, isOpen, modalProps } = useModalStore();

    if (!isOpen) return null;

    switch (modalType) {
        case "notification":
            return <NotificationModal {...modalProps} />;

        case "createArena":
        // return <CreateArenaModal {...modalProps} />;

        default:
            return null;
    }
}
