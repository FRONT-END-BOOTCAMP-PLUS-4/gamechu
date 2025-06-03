export function getEarliestReleaseDate(game: {
    involved_companies: {
        developer: boolean;
        company: { name: string } | null;
    }[];
    release_dates: { date: number }[] | null;
    releaseDate: Date | null;
    developer: string | null;
}): Date | null {
    if (!game.release_dates?.length) return null;

    const dates = game.release_dates
        .map((r: { date: number }) => r.date)
        .filter((d: number | undefined) => typeof d === "number");

    if (dates.length === 0) return null;

    const earliest = Math.min(...dates);
    return new Date(earliest * 1000); // IGDB 날짜는 초 단위 Unix timestamp
}
