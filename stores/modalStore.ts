import { create } from "zustand";

type ModalType = "notification" | "createArena";
type ModalPosition = "center" | "anchor-bottom";

interface ModalStore {
    modalType: ModalType;
    isOpen: boolean;
    modalProps: any;
    modalPosition: ModalPosition;
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
    modalType: null,
    isOpen: false,
    modalProps: null,
    openModal: (type: ModalType, props: any = null, position: ModalPosition) =>
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
