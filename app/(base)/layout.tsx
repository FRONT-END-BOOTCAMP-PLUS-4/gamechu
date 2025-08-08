// app/(base)/layout.tsx
import HeaderWrapper from "../components/HeaderWrapper"; // ✅ CSR Header Wrapper
import Footer from "../components/Footer";
import GlobalAttendanceToast from "./components/GlobalAttendanceToast";
import "../globals.css";
export { viewport } from "../viewport";
import LottieLoaderWrapper from "../components/LottieLoaderWrapper";

export default function BaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HeaderWrapper /> {/* CSR로만 렌더링됨 */}
            <main className="mx-auto max-w-[1480px] px-10 font-sans text-font-100">
                <LottieLoaderWrapper />
                <GlobalAttendanceToast />

                {children}
            </main>
            <Footer />
        </>
    );
}
