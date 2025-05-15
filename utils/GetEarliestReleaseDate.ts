export function getEarliestReleaseDate(game: any): Date | null {
    if (!game.release_dates?.length) return null;

    const dates = game.release_dates
        .map((r: any) => r.date)
        .filter((d: number | undefined) => typeof d === "number");

    if (dates.length === 0) return null;

    const earliest = Math.min(...dates);
    return new Date(earliest * 1000); // IGDB 날짜는 초 단위 Unix timestamp
}
