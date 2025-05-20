import { create } from "zustand";

type ModalType = "notification" | "createArena" | null;
type ModalPosition = "center" | "anchor-bottom" | null;

interface ModalStore {
    modalType: ModalType;
    modalPosition: ModalPosition;
    isOpen: boolean;
    modalProps: any;
    openModal: (type: ModalType, position: ModalPosition, props?: any) => void;
    closeModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
    modalType: null,
    modalPosition: null,
    isOpen: false,
    modalProps: null,
    openModal: (type: ModalType, position: ModalPosition, props: any = null) =>
        set({
            modalType: type,
            modalProps: props,
            modalPosition: position,
            isOpen: true,
        }),
    closeModal: () =>
        set({
            modalType: null,
            modalProps: null,
            modalPosition: null,
            isOpen: false,
        }),
}));

export default useModalStore;
