// app/(base)/layout.tsx
import HeaderWrapper from "../components/HeaderWrapper"; // ✅ CSR Header Wrapper
import Footer from "../components/Footer";
import GlobalAttendanceChecker from "../components/GlobalAttendanceChecker"; // ✅ 추가
import "../globals.css";
export { viewport } from "../viewport";

export default function BaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HeaderWrapper /> {/* CSR로만 렌더링됨 */}
            <main className="max-w-[1480px] mx-auto px-10 bg-background-400 text-font-100 font-sans">
                <GlobalAttendanceChecker /> {/* ✅ 여기에 삽입 */}
                {children}
            </main>
            <Footer />
        </>
    );
}
