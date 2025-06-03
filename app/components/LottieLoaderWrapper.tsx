"use client";

import dynamic from "next/dynamic";
const LottieLoader = dynamic(() => import("./LottieLoader"), { ssr: false });

export default function LottieLoaderWrapper() {
    return <LottieLoader />;
}
