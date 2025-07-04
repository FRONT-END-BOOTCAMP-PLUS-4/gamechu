export class GameFilter {
    constructor(
        public genreId?: number,
        public themeId?: number,
        public platformId?: number,
        public keyword?: string,
        public sort: "latest" | "popular" | "rating" = "popular",
        public ascending: boolean = false,
        public offset: number = 0,
        public limit: number = 6
    ) {}
}
