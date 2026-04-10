// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWishlist } from "../useWishlist";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

describe("useWishlist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("fetches wishlist status when viewerId is set", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ exists: true, wishlistId: 10 }),
        } as unknown as Response);

        const { result } = renderHook(() => useWishlist(1, "user-abc"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.isWished).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/member/wishlists?gameId=1")
        );
    });

    it("does NOT fetch when viewerId is empty string", async () => {
        const { result } = renderHook(() => useWishlist(1, ""), {
            wrapper: createWrapper(),
        });

        // enabled=false — TQ skips fetching, isLoading stays false
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(fetch).not.toHaveBeenCalled();
        expect(result.current.isWished).toBe(false);
    });

    it("toggle calls POST when not wished", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ exists: false, wishlistId: null }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ wishlistId: 99 }),
            } as unknown as Response);

        const { result } = renderHook(() => useWishlist(1, "user-abc"), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggle();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/member/wishlists",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("toggle calls DELETE when already wished", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ exists: true, wishlistId: 10 }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            } as unknown as Response);

        const { result } = renderHook(() => useWishlist(1, "user-abc"), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.toggle();
        });

        expect(fetch).toHaveBeenCalledWith(
            "/api/member/wishlists/1",
            expect.objectContaining({ method: "DELETE" })
        );
    });
});
