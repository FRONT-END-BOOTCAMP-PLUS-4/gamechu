// hooks/useArenaList.ts
import { useEffect, useState } from "react";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

export function useArenaList() {
    const [arenaList, setArenaList] = useState<ArenaDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch("/api/arenas")
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success && Array.isArray(resData.data)) {
                    setArenaList(resData.data);
                } else {
                    setArenaList([]);
                }
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { arenaList, setArenaList, loading, error };
}
