import { describe, it, expect, beforeEach } from "vitest";
import useArenaStore from "../useArenaStore";

const mockArenaData = {
    id: 1,
    title: "Test Arena",
} as any;

describe("useArenaStore", () => {
    beforeEach(() => {
        useArenaStore.setState({ arenaData: null });
    });

    it("initial state: arenaData is null", () => {
        expect(useArenaStore.getState().arenaData).toBeNull();
    });

    it("setArenaData: stores data", () => {
        useArenaStore.getState().setArenaData(mockArenaData);
        expect(useArenaStore.getState().arenaData).toEqual(mockArenaData);
    });

    it("clearArenaData: resets to null", () => {
        useArenaStore.getState().setArenaData(mockArenaData);
        useArenaStore.getState().clearArenaData();
        expect(useArenaStore.getState().arenaData).toBeNull();
    });
});
