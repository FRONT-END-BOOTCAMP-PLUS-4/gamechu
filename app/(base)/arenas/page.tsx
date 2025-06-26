// app/(base)/arenas/page.tsx
import { Suspense } from "react";
import ArenaPage from "./ArenaPage";

export const dynamic = "force-dynamic"; // CSR 강제

export default function ArenaPageWrapper() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <ArenaPage />
        </Suspense>
    );
}
