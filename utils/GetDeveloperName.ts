export function getDeveloperName(game: {
    involved_companies: {
        developer: boolean;
        company: { name: string } | null;
    }[];
    release_dates: { date: number }[] | null;
    releaseDate: Date | null;
    developer: string | null;
}): string | null {
    if (!game.involved_companies?.length) return null;

    const dev = game.involved_companies.find(
        (c: { developer: boolean; company: { name: string } | null }) =>
            c.developer === true && c.company?.name
    );

    return dev?.company?.name || null;
}
