"use client";

import useModalStore from "@/stores/modalStore";

export default function Modal() {
    const { modalType, isOpen, modalProps, modalPosition } = useModalStore();

    if (!isOpen) return null;

    switch (modalType) {
        case "notification":
        // return <NotificationModal modalProps={modalProps} modalPosition={modalPosition} />;

        case "createArena":
        // return <CreateArenaModal {...modalProps} modalPosition/>;

        default:
            return null;
    }
}
