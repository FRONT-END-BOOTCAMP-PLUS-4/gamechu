import { create } from "zustand";

export const useLoadingStore = create<{
    loading: boolean;
    setLoading: (v: boolean) => void;
}>((set) => ({
    loading: false,
    setLoading: (v) => set({ loading: v }),
}));
