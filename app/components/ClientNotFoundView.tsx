"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lottie를 동적으로 import
const NotFoundLottie = dynamic(() => import("./NotFoundLottie"), {
    ssr: false,
    loading: () => (
        <div className="w-[600px] h-[600px] bg-gray-100 animate-pulse" />
    ),
});

export default function ClientNotFoundView() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/");
        }, 5000); // 5초 후 루트로 이동

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
    }, [router]);

    return (
        <div className="w-[600px] h-[600px] overflow-hidden">
            <NotFoundLottie />
        </div>
    );
}
