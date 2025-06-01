import { useEffect, useState } from "react";
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";

type FetchArenasParams = {
    currentPage?: number;
    status: number;
    mine: boolean;
    pageSize: number;
};

export default function useFetchArenas({
    currentPage = 1,
    status,
    mine = false,
    pageSize = 10,
}: FetchArenasParams) {
    const [arenaListDto, setArenaListDto] = useState<ArenaListDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = new URLSearchParams({
                    currentPage: currentPage.toString(),
                    mine: mine.toString(),
                    pageSize: pageSize.toString(),
                    ...(status !== undefined
                        ? { status: status.toString() }
                        : {}),
                }).toString();

                const res = await fetch(`/api/arenas?${query}`);
                const json = await res.json();
                setArenaListDto(json);
            } catch (error: unknown) {
                if (error instanceof Error) setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, status, mine, pageSize]);

    return { arenaListDto, setArenaListDto, loading, error };
}
