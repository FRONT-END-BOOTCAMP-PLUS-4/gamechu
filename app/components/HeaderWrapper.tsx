// components/HeaderWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const ClientHeader = dynamic(() => import("./Header"), { ssr: false });

export default function HeaderWrapper() {
    return <ClientHeader />;
}
