import { GameCardDto } from "./GameCardDto";

export interface GetFilteredGamesResponseDto {
    data: GameCardDto[];
    totalCount: number;
}
