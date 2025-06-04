"use client";

import Lottie from "lottie-react";
import animationData from "@/public/404.json";

export default function NotFoundLottie() {
    return (
        <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: "100%", height: "100%" }} // ✅ 필수
        />
    );
}
