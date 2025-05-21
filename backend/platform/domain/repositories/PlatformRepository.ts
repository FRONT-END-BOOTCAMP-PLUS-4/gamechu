// 📁 backend/platform/domain/repositories/PlatformRepository.ts
import { Platform } from "@/prisma/generated";

export interface PlatformRepository {
    getAllPlatforms(): Promise<Platform[]>;
}
