// domain/repositories/filters/GameFilter.ts

export class GameFilter {
    public genreId?: number;
    public themeId?: number;
    public platformId?: number;
    public keyword?: string;
    public sort: "latest" | "popular" | "rating";
    public ascending: boolean;
    public offset: number;
    public limit: number;

    constructor(query: {
        genre?: string;
        theme?: string;
        platform?: string;
        keyword?: string;
        sort?: "latest" | "popular" | "rating";
        page?: string;
        size?: string;
    }) {
        this.genreId = query.genre ? parseInt(query.genre, 10) : undefined;
        this.themeId = query.theme ? parseInt(query.theme, 10) : undefined;
        this.platformId = query.platform
            ? parseInt(query.platform, 10)
            : undefined;
        this.keyword = query.keyword;

        this.sort = query.sort ?? "popular";
        this.ascending = false;

        const pageNumber = query.page ? parseInt(query.page, 10) : 1;
        const pageSize = query.size ? parseInt(query.size, 10) : 6;

        this.offset = (pageNumber - 1) * pageSize;
        this.limit = pageSize;
    }
}
