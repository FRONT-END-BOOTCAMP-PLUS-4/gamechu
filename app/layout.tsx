import Modals from "./components/Modals";
import "./globals.css";
export { viewport } from "./viewport";
import LottieLoader from "./components/LottieLoader";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="font-sans bg-background-400 text-font-100">
                <LottieLoader />
                <Modals />
                {children}
            </body>
        </html>
    );
}
