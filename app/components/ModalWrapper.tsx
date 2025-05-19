"use client";

import { ReactNode, RefObject, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalWrapperProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    anchorRef?: RefObject<HTMLElement>;
};

export default function ModalWrapper(modalWrapperProps: ModalWrapperProps) {
    useEffect(() => {
        if (!modalWrapperProps.isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") modalWrapperProps.onClose();
        };

        document.addEventListener("keyup", handleEscape);

        return () => {
            document.removeEventListener("keyup", handleEscape);
        };
    }, [modalWrapperProps]);

    if (!modalWrapperProps.isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={modalWrapperProps.onClose}
        >
            <div
                className="bg-gray-800 text-white rounded-xl p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {modalWrapperProps.children}
            </div>
        </div>,
        document.body
    );
}
