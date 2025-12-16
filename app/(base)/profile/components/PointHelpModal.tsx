"use client";

import { useEffect, useId, useRef } from "react";

type PointHelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function PointHelpModal({ open, onClose }: PointHelpModalProps) {
    const dialogTitleId = useId();
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);

        // 열리면 닫기 버튼 포커스
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            id="tier-point-help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="fixed inset-0 z-50"
        >
            {/* overlay */}
            <button
                type="button"
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="모달 닫기"
            />

            {/* panel */}
            <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background-300 p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3
                            id={dialogTitleId}
                            className="text-base font-semibold text-font-100"
                        >
                            포인트는 어떻게 쌓이고, 왜 줄어들까요?
                        </h3>
                    </div>
                </div>

                <div className="mt-5 space-y-4 text-sm text-font-100">
                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">✅ 포인트 적립</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>출석 체크: +5</li>
                            <li>리뷰 좋아요 획득:+5</li>
                            <li>투기장 무승부: +100</li>
                            <li>투기장 미성립: +100</li>
                            <li>투기장 승리: +190</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">⚠️ 포인트 차감</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>투기장 참여: -100</li>
                            <li>리뷰 좋아요 삭제: -5</li>
                            <li>리뷰 삭제: -5 ~ -100</li>
                        </ul>
                    </div>

                    <div className="rounded-xl bg-background-200 p-4">
                        <div className="font-semibold">ℹ️ 티어 계산</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-font-200">
                            <li>처음 가입할 때 500점으로 시작합니다.</li>
                            <li>
                                0~999점은 브론즈, 1000~1999점은 실버,
                                2000~2999점은 골드, 3000~3999점은 플래티넘,
                                4000점 이상은 다이아몬드입니다.
                            </li>
                            <li>
                                다음 티어까지는{" "}
                                <span className="font-semibold text-font-100">
                                    다음 티어 최소점수 - 현재점수
                                </span>
                                로 표시됩니다.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-background-200 px-4 py-2 text-sm text-font-100 hover:opacity-90"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
