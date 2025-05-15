export function getDeveloperName(game: any): string | null {
    if (!game.involved_companies?.length) return null;

    const dev = game.involved_companies.find(
        (c: any) => c.developer === true && c.company?.name
    );

    return dev?.company?.name || null;
}
