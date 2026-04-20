"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

type ModalWrapperProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    labelId?: string;
};

export default function ModalWrapper({
    isOpen,
    onClose,
    children,
    labelId,
}: ModalWrapperProps) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 px-2 sm:px-4" // z-[10001]: LottieLoader(z-[9999]) 위에 표시되도록
            onClick={onClose}
        >
            <FocusTrap
                active={isOpen}
                focusTrapOptions={{
                    escapeDeactivates: false,
                    allowOutsideClick: true,
                    returnFocusOnDeactivate: true,
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelId}
                    className="max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-xl bg-background-300 p-6 text-font-100 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </FocusTrap>
        </div>,
        document.body
    );
}
