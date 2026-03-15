import { describe, it, expect, beforeEach } from "vitest";
import { useLoadingStore } from "../loadingStore";

describe("loadingStore", () => {
    beforeEach(() => {
        useLoadingStore.setState({ loading: false });
    });

    it("initial state: loading is false", () => {
        expect(useLoadingStore.getState().loading).toBe(false);
    });

    it("setLoading(true): sets loading to true", () => {
        useLoadingStore.getState().setLoading(true);
        expect(useLoadingStore.getState().loading).toBe(true);
    });

    it("setLoading(false): sets loading back to false", () => {
        useLoadingStore.getState().setLoading(true);
        useLoadingStore.getState().setLoading(false);
        expect(useLoadingStore.getState().loading).toBe(false);
    });
});
