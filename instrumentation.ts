export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { recoverPendingArenaTimers } = await import(
            "@/lib/ArenaTimerRecovery"
        );
        await recoverPendingArenaTimers();
    }
}
