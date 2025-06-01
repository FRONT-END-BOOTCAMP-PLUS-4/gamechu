"use client";

import useModalStore from "@/stores/modalStore";
import NotificationModal from "@/app/(base)/components/NotificationModal";
import CreateArenaModal from "../(base)/arenas/components/CreateArenaModal";

export default function Modals() {
    const { modalType, isOpen } = useModalStore();

    if (!isOpen) return null;

    switch (modalType) {
        case "notification":
            return <NotificationModal />;

        case "createArena":
            return <CreateArenaModal />;

        default:
            return null;
    }
}
