import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../AuthStore";

describe("AuthStore", () => {
    beforeEach(() => {
        useAuthStore.setState({ user: null });
    });

    it("initial state: user is null", () => {
        expect(useAuthStore.getState().user).toBeNull();
    });

    it("setUser: updates user", () => {
        useAuthStore.getState().setUser({ id: "user-1" });
        expect(useAuthStore.getState().user).toEqual({ id: "user-1" });
    });

    it("clearUser: resets user to null", () => {
        useAuthStore.getState().setUser({ id: "user-1" });
        useAuthStore.getState().clearUser();
        expect(useAuthStore.getState().user).toBeNull();
    });
});
