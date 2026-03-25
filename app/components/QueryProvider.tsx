// app/components/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

/**
 * "use client" wrapper so app/layout.tsx stays a Server Component.
 * Children passed as props remain server-rendered — the "use client" boundary
 * applies only to QueryProvider itself, not to its children prop.
 *
 * gcTime matches staleTime (60s) to prevent auth-gated data (wishlist,
 * notifications, my votes) from persisting in cache across sessions.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        gcTime: 60_000,
                        retry: 1,
                    },
                },
            })
    );
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
}
