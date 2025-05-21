// 📁 backend/theme/domain/repositories/ThemeRepository.ts
import { Theme } from "@/prisma/generated";

export interface ThemeRepository {
    getAllThemes(): Promise<Theme[]>;
}