"use client";

import Image from "next/image";
import useModalStore from "@/stores/ModalStore";
import { useNotificationCount } from "@/hooks/useNotificationCount";

type Props = {
    size?: number;
    onOpen?: () => void;
};

export default function NotificationBellButton({ size = 24, onOpen }: Props) {
    const { data } = useNotificationCount();
    const count = data?.count ?? 0;

    const handleClick = () => {
        useModalStore.getState().openModal("notification", null);
        onOpen?.();
    };

    return (
        <button
            className="relative rounded-lg p-2 transition-colors hover:bg-white/20"
            aria-label="알림"
            onClick={handleClick}
        >
            <Image
                src="/icons/bell.svg"
                alt=""
                width={size}
                height={size}
                className="text-white"
            />
            {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-caption font-bold text-white">
                    {count > 99 ? "99+" : count}
                </span>
)}
        </button>
    );
}
