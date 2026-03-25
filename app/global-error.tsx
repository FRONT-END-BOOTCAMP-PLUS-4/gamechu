"use client";

// next/font/google inside a "use client" component is normally not supported,
// but global-error.tsx is a Next.js 15 special file that owns <html>/<body> directly
// (root layout is bypassed on root crashes), so Next.js allows font loading here.
import { Press_Start_2P } from "next/font/google";
import "./globals.css"; // Required: root layout is bypassed, styles must be imported here
import ErrorView from "./components/ErrorView";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
    display: "swap",
});

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ko" className={pressStart2P.variable}>
            <body className="bg-background-400 font-sans text-font-100">
                <ErrorView reset={reset} />
            </body>
        </html>
    );
}
