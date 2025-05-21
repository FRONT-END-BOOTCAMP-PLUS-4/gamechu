export interface ArenaDetailDto {
    id: number;
    creatorName: string;
    challengerId: string | null;
    title: string;
    description: string;
    startDate: Date;
    status: number;
}
