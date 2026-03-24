"use client";

import "./globals.css"; // Required: root layout is bypassed, styles must be imported here
import ErrorView from "./components/ErrorView";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ko">
            <body className="bg-background-400 font-sans text-font-100">
                <ErrorView reset={reset} />
            </body>
        </html>
    );
}
