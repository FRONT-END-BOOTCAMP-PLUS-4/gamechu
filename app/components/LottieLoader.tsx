"use client";
import Lottie from "lottie-react";
import { useLoadingStore } from "@/stores/LoadingStore";
import loadingJson from "@/public/loading.json";

export default function LottieLoader() {
    const { loading } = useLoadingStore();
    if (!loading) return null;

    return (
        // pointer-events-none: 로딩 중에도 모달 등 하단 UI와 상호작용 가능하도록 의도적으로 허용
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-background-400 opacity-50" />

            <div className="relative z-10">
                <Lottie
                    animationData={loadingJson}
                    loop
                    autoplay
                    className="h-[350px] w-[350px]"
                />
            </div>
        </div>
    );
}
