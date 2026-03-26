"use client";

import { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";

type ModalWrapperProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    anchorRef?: RefObject<HTMLElement>;
    labelId?: string;
};

export default function ModalWrapper({
    isOpen,
    onClose,
    children,
    labelId,
}: ModalWrapperProps) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4"
            onClick={onClose}
        >
            <FocusTrap
                active={isOpen}
                focusTrapOptions={{
                    onDeactivate: onClose,
                    returnFocusOnDeactivate: true,
                    escapeDeactivates: true,
                    allowOutsideClick: true,
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
