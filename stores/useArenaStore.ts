import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";
import { create } from "zustand";

interface ArenaState {
    arenaData: ArenaDetailDto | null; // 현재 보고 있는 아레나 데이터
    setArenaData: (data: ArenaDetailDto) => void;
    clearArenaData: () => void;
}

const useArenaStore = create<ArenaState>((set) => ({
    arenaData: null,
    setArenaData: (data) => set({ arenaData: data }),
    clearArenaData: () => set({ arenaData: null }),
}));

export default useArenaStore;
