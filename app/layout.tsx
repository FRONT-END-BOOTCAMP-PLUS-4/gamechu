import Modals from "./components/Modals";
import "./globals.css";
export { viewport } from "./viewport";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="bg-background-400 font-sans text-font-100">
                <Modals />
                {children}
            </body>
        </html>
    );
}
