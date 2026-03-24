"use client";

import ErrorView from "../components/ErrorView";

export default function Error({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErrorView reset={reset} />;
}
