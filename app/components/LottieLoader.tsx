"use client";
import Lottie from "lottie-react";
import { useLoadingStore } from "@/stores/loadingStore";
import loadingJson from "@/public/loading.json";

export default function LottieLoader() {
    const { loading } = useLoadingStore();
    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-background-400 opacity-50" />

            <div className="relative z-10">
                <Lottie
                    animationData={loadingJson}
                    loop
                    autoplay
                    className="w-[350px] h-[350px]"
                />
            </div>
        </div>
    );
}
