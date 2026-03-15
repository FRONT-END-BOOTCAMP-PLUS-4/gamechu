// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchArenas from "../useArenas";

const mockArenaListDto = {
    arenas: [{ id: 1, title: "Arena 1" }],
    totalCount: 1,
    currentPage: 1,
    pages: [1],
    endPage: 1,
};

describe("useFetchArenas", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("returns arenaListDto on successful fetch", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useFetchArenas({ status: 1, mine: false, pageSize: 10 })
        );

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaListDto).toEqual(mockArenaListDto);
        expect(result.current.error).toBeNull();
    });

    it("sets error on fetch failure", async () => {
        vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() =>
            useFetchArenas({ status: 1, mine: false, pageSize: 10 })
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("Network error");
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(() =>
            useFetchArenas({ status: 0, mine: false, pageSize: 10 })
        );

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("builds correct URL params with status, mine, pageSize", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(() =>
            useFetchArenas({ status: 2, mine: true, pageSize: 20, currentPage: 2 })
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("status=2")
            );
        });
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("pageSize=20")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("currentPage=2")
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("mine=true")
        );
    });

    it("uses memberId param when targetMemberId is provided", async () => {
        vi.mocked(fetch).mockResolvedValue({
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(() =>
            useFetchArenas({
                status: 1,
                mine: false,
                pageSize: 10,
                targetMemberId: "target-123",
            })
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("memberId=target-123")
            );
        });
    });
});
