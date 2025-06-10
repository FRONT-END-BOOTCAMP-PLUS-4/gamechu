export class CreatePreferredPlatformsDto {
    constructor(
        public memberId: string,
        public platformIds: number[]
    ) {}    
}