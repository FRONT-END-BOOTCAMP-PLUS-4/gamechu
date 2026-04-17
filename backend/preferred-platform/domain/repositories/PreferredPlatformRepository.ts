export type CreatePreferredPlatformInput = {
    memberId: string;
    platformId: number;
};

export interface PreferredPlatformRepository {
    saveMany(inputs: CreatePreferredPlatformInput[]): Promise<void>;
    delete(memberId: string): Promise<void>;
}
