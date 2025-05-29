import { ApplyAttendanceScoreDto } from "./dto/ApplyAttendanceScoreDto";
import { ScorePolicy } from "../../domain/ScorePolicy";
import { ScoreRecordRepository } from "@/backend/score-record/domain/repositories/ScoreRecordRepository";

export class ApplyAttendanceScoreUsecase {
    constructor(
        private readonly scorePolicy: ScorePolicy,
        private readonly memberRepository: {
            getLastAttendedDate: (memberId: string) => Promise<Date | null>;
            updateLastAttendedDate: (memberId: string, date: Date) => Promise<void>;
            incrementScore: (memberId: string, delta: number) => Promise<void>;
        },
        private readonly scoreRecordRepository: ScoreRecordRepository
    ) {}

    async execute({ memberId, lastAttendedDate }: ApplyAttendanceScoreDto): Promise<void> {
    const now = new Date();
    const isSameDay = lastAttendedDate &&
        lastAttendedDate.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) ===
        now.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });

    if (isSameDay) return;

    const delta = this.scorePolicy.getAttendanceDelta();
    const policyId = this.scorePolicy.getAttendancePolicyId();

    await this.memberRepository.incrementScore(memberId, delta);
    await this.memberRepository.updateLastAttendedDate(memberId, now);

    await this.scoreRecordRepository.createRecord({
        memberId,
        policyId,
        actualScore: delta,
    });
}
}
