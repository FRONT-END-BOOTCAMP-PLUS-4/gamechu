"use client";

import { useEffect, useState } from "react";
import PointHistoryCard from "../PointHistoryCard";
import Pager from "@/app/components/Pager";

interface ScoreRecord {
    id: number;
    policyName: string;
    description: string;
    score: number;
    imageUrl: string;
    createdAt: string;
}

export default function ProfilePointHistoryTab() {
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
            try {
                const res = await fetch("/api/member/scores");
                if (!res.ok) throw new Error("스코어 기록 조회 실패");
                const data = await res.json();
                setRecords(data);
            } catch (err) {
                console.error("🔥 포인트 히스토리 조회 실패", err);
            }
        };

        fetchRecords();
    }, []);

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-8">
            <h2 className="text-lg font-semibold text-body">포인트 히스토리</h2>

            {records.length === 0 ? (
                <p className="text-font-100">포인트 기록이 없습니다.</p>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        {currentRecords.map((r) => (
                            <PointHistoryCard
                                key={r.id}
                                policyName={r.policyName}
                                description={r.description}
                                score={r.score}
                                imageUrl={r.imageUrl}
                                createdAt={r.createdAt}
                            />
                        ))}
                    </div>

                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
}
