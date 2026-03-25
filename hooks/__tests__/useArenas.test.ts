// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useFetchArenas from "../useArenas";
import { createWrapper } from "@/tests/utils/createQueryWrapper";

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
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 1, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.arenaListDto).toEqual(mockArenaListDto);
        expect(result.current.error).toBeNull();
    });

    it("sets error on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: "서버 오류" }),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 1, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).not.toBeNull();
    });

    it("loading starts true and ends false", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        const { result } = renderHook(
            () => useFetchArenas({ status: 0, mine: false, pageSize: 10 }),
            { wrapper: createWrapper() }
        );

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("builds correct URL params", async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(
            () =>
                useFetchArenas({
                    status: 2,
                    mine: true,
                    pageSize: 20,
                    currentPage: 2,
                }),
            { wrapper: createWrapper() }
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
            ok: true,
            json: () => Promise.resolve(mockArenaListDto),
        } as unknown as Response);

        renderHook(
            () =>
                useFetchArenas({
                    status: 1,
                    mine: false,
                    pageSize: 10,
                    targetMemberId: "target-123",
                }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("memberId=target-123")
            );
        });
    });
});
