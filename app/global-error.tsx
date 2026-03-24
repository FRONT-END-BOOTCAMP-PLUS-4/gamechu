"use client";

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
