// app/(base)/layout.tsx
import type { Metadata } from "next";
// import HeaderWrapper from "../components/HeaderWrapper"; // ✅ CSR Header Wrapper
import Header from "../components/Header";
import Footer from "../components/Footer";
import GlobalAttendanceToast from "./components/GlobalAttendanceToast";
import "../globals.css";
export { viewport } from "../viewport";
import LottieLoaderWrapper from "../components/LottieLoaderWrapper";

export const metadata: Metadata = {
    title: {
        default: "GameChu", // 기본 제목
        template: "%s | GameChu", // 개별 페이지에서 덮어쓸 때 형식
    },
    description:
        "GameChu에서 게임 리뷰, 위시리스트, 포인트 기록, 아레나 전적을 한눈에 확인하세요.",
};

export default function BaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="mx-auto max-w-[1480px] font-sans text-font-100 sm:px-10">
                <LottieLoaderWrapper />
                <GlobalAttendanceToast />
                {children}
            </main>
            <Footer />
        </>
    );
}
