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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50"
            onClick={modalWrapperProps.onClose}
        >
            <div
                className="bg-background-300 text-font-100 rounded-xl p-2.5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {modalWrapperProps.children}
            </div>
        </div>,
        document.body
    );
}
