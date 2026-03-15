import { describe, it, expect, beforeEach } from "vitest";
import useModalStore from "../modalStore";

describe("modalStore", () => {
    beforeEach(() => {
        useModalStore.setState({
            modalType: null,
            modalPosition: null,
            isOpen: false,
        });
    });

    it("initial state: isOpen false, modalType null", () => {
        const state = useModalStore.getState();
        expect(state.isOpen).toBe(false);
        expect(state.modalType).toBeNull();
        expect(state.modalPosition).toBeNull();
    });

    it("openModal: sets isOpen true with type and position", () => {
        useModalStore.getState().openModal("notification", "center");
        const state = useModalStore.getState();
        expect(state.isOpen).toBe(true);
        expect(state.modalType).toBe("notification");
        expect(state.modalPosition).toBe("center");
    });

    it("closeModal: resets to closed state", () => {
        useModalStore.getState().openModal("createArena", "anchor-bottom");
        useModalStore.getState().closeModal();
        const state = useModalStore.getState();
        expect(state.isOpen).toBe(false);
        expect(state.modalType).toBeNull();
        expect(state.modalPosition).toBeNull();
    });
});
