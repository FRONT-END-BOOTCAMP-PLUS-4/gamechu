export type CreatePreferredPlatformInput = {
    memberId: string;
    platformId: number;
};

export interface PreferredPlatformRepository {
    replaceAll(memberId: string, inputs: CreatePreferredPlatformInput[]): Promise<void>;
}
