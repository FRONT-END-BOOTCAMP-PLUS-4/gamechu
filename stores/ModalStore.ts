import { create } from "zustand";

type ModalType = "notification" | "createArena" | null;
type ModalPosition = "center" | "anchor-bottom" | null;

interface ModalStore {
    modalType: ModalType;
    modalPosition: ModalPosition;
    isOpen: boolean;
    openModal: (type: ModalType, position: ModalPosition) => void;
    closeModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
    modalType: null,
    modalPosition: null,
    isOpen: false,
    modalProps: null,
    openModal: (type: ModalType, position: ModalPosition) =>
        set({
            modalType: type,
            modalPosition: position,
            isOpen: true,
        }),
    closeModal: () =>
        set({
            modalType: null,
            modalPosition: null,
            isOpen: false,
        }),
}));

export default useModalStore;
