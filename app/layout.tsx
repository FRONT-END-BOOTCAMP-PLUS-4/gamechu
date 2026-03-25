import { Press_Start_2P } from "next/font/google";
import Modals from "./components/Modals";
import QueryProvider from "./components/QueryProvider";
import "./globals.css";
export { viewport } from "./viewport";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className={pressStart2P.variable}>
            <body className="bg-background-400 font-sans text-font-100">
                <QueryProvider>
                    <Modals />
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
