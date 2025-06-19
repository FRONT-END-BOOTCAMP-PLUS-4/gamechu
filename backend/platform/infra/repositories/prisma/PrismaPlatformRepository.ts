import { PlatformRepository } from "@/backend/platform/domain/repositories/PlatformRepository";
import { PrismaClient } from "@/prisma/generated";

export class PrismaPlatformRepository implements PlatformRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    
    async findAll(): Promise<{ id: number; name: string }[]> {
        return await this.prisma.platform.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }
}
