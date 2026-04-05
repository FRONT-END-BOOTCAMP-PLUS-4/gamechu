"use client";

import { useEffect, useState } from "react";
import PointHistoryCard from "../PointHistoryCard";
import Pager from "@/app/components/Pager";
import { useLoadingStore } from "@/stores/loadingStore"; // ✅ 전역 로딩 상태 사용

interface ScoreRecord {
    actualScore: number;
    id: number;
    policyName: string;
    description: string;
    score: number;
    imageUrl: string;
    createdAt: string;
}

export default function ProfilePointHistoryTab() {
    const { setLoading } = useLoadingStore(); // ✅ 전역 로딩 제어
    const [records, setRecords] = useState<ScoreRecord[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const totalItems = records.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    const currentRecords = records.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true); // ✅ 로딩 시작

            try {
                const res = await fetch("/api/member/scores");
                if (!res.ok) throw new Error("스코어 기록 조회 실패");
                const data = await res.json();
                setRecords(data);
            } catch {
                // fetch error — silently ignored; records remain empty
            } finally {
                setLoading(false); // ✅ 로딩 종료
            }
        };

        fetchRecords();
    }, [setLoading]);

    return (
        <div className="flex w-full flex-col gap-8 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="text-lg font-semibold">포인트 히스토리</h2>

            {records.length === 0 ? (
                <p className="text-sm text-font-200">포인트 기록이 없습니다.</p>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        {currentRecords.map((r) => (
                            <PointHistoryCard
                                key={r.id}
                                policyName={r.policyName}
                                description={r.description}
                                score={r.actualScore}
                                imageUrl={r.imageUrl}
                                createdAt={r.createdAt}
                            />
                        ))}
                    </div>

                    {endPage > 1 && (
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}
