/**
 * Shared GET fetcher for TanStack Query queryFn calls.
 * All API routes are same-origin — the browser sends session cookies automatically.
 * Mutations (POST/PATCH/DELETE) call fetch() directly, not this utility.
 */
export async function fetcher<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
            (body as { message?: string }).message ?? `HTTP ${res.status}`
        );
    }
    return res.json() as Promise<T>;
}
