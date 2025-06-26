// app/(auth)/log-in/page.tsx
import { Suspense } from "react";
import LoginPage from "./LoginPage";

export const dynamic = "force-dynamic"; // ✅ CSR로 동작하게 강제

export default function LogInPageWrapper() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <LoginPage />
        </Suspense>
    );
}
