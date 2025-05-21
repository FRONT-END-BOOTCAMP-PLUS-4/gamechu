import { create } from "zustand";

interface ArenaData {
    title: string;
    author: string;
    content: string;
    startAt: string;
    leftVotes: number;
    rightVotes: number;
    status: "recruiting" | "waiting" | "active" | "voting" | "closed";
}

interface ArenaStore {
    arenaData: ArenaData | null;
    setArenaData: (data: ArenaData) => void;
    setStatus: (status: ArenaData["status"]) => void;
}

export const useArenaStore = create<ArenaStore>((set) => ({
    arenaData: null,
    setArenaData: (data) => set({ arenaData: data }),
    setStatus: (status) =>
        set((state) =>
            state.arenaData
                ? { arenaData: { ...state.arenaData, status } }
                : state
        ),
}));
