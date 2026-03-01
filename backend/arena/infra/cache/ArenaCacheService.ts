import redis from "@/lib/redis";
import {
    generateArenaCacheKey,
    generateArenaDetailCacheKey,
    getArenaCachePatterns,
} from "@/lib/cacheKey";
import { ArenaListDto } from "@/backend/arena/application/usecase/dto/ArenaListDto";
import { ArenaDetailDto } from "@/backend/arena/application/usecase/dto/ArenaDetailDto";

const CACHE_TTL = 60; // 1분 (arena는 자주 변경되므로 짧게 설정)
const DETAIL_CACHE_TTL = 120; // 2분

export class ArenaCacheService {
    /**
     * Arena 리스트 캐시 조회
     */
    async getArenaListCache(params: {
        currentPage: number;
        status?: number;
        targetMemberId?: string;
        pageSize: number;
    }): Promise<ArenaListDto | null> {
        try {
            const cacheKey = generateArenaCacheKey(params);
            const cached = await redis.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error("Cache read error:", error);
            return null;
        }
    }

    /**
     * Arena 리스트 캐시 저장
     */
    async setArenaListCache(
        params: {
            currentPage: number;
            status?: number;
            targetMemberId?: string;
            pageSize: number;
        },
        data: ArenaListDto
    ): Promise<void> {
        try {
            const cacheKey = generateArenaCacheKey(params);
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
        } catch (error) {
            console.error("Cache write error:", error);
        }
    }

    /**
     * Arena 상세 정보 캐시 조회
     */
    async getArenaDetailCache(arenaId: number): Promise<ArenaDetailDto | null> {
        try {
            const cacheKey = generateArenaDetailCacheKey(arenaId);
            const cached = await redis.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error("Cache read error:", error);
            return null;
        }
    }

    /**
     * Arena 상세 정보 캐시 저장
     */
    async setArenaDetailCache(
        arenaId: number,
        data: ArenaDetailDto
    ): Promise<void> {
        try {
            const cacheKey = generateArenaDetailCacheKey(arenaId);
            await redis.setex(cacheKey, DETAIL_CACHE_TTL, JSON.stringify(data));
        } catch (error) {
            console.error("Cache write error:", error);
        }
    }

    /**
     * 특정 arena 관련 모든 캐시 무효화
     */
    async invalidateArenaCache(arenaId: number): Promise<void> {
        try {
            const detailKey = generateArenaDetailCacheKey(arenaId);
            await redis.del(detailKey);

            // list cache는 패턴으로 무효화 (모든 페이지의 리스트 캐시 제거)
            await this.invalidateArenaListCaches();
        } catch (error) {
            console.error("Cache invalidation error:", error);
        }
    }

    /**
     * 특정 사용자의 arena 캐시 무효화
     */
    async invalidateUserArenaCache(userId: string): Promise<void> {
        try {
            const patterns = getArenaCachePatterns(userId);
            for (const pattern of patterns) {
                await this.deleteKeysByPattern(pattern);
            }
        } catch (error) {
            console.error("User cache invalidation error:", error);
        }
    }

    /**
     * 모든 arena 리스트 캐시 무효화
     */
    async invalidateArenaListCaches(): Promise<void> {
        try {
            await this.deleteKeysByPattern("arena:list:*");
        } catch (error) {
            console.error("Arena list cache invalidation error:", error);
        }
    }

    /**
     * SCAN 기반 패턴 매칭 키 삭제 (프로덕션 안전)
     */
    private async deleteKeysByPattern(pattern: string): Promise<void> {
        const stream = redis.scanStream({ match: pattern, count: 100 });
        const pipeline = redis.pipeline();
        let count = 0;

        return new Promise((resolve, reject) => {
            stream.on("data", (keys: string[]) => {
                for (const key of keys) {
                    pipeline.del(key);
                    count++;
                }
            });
            stream.on("end", async () => {
                if (count > 0) {
                    await pipeline.exec();
                }
                resolve();
            });
            stream.on("error", reject);
        });
    }
}
