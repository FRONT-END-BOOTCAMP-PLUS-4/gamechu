"use client";

import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateArenaModal() {
    const { isOpen, closeModal } = useModalStore();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<Date>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(0, 0, 0);
        return tomorrow;
    });
    const [titleError, setTitleError] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string>("");
    const [dateError, setDateError] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    // 모달 열렸을 때 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const validate = () => {
        let valid = true;
        if (!title.trim()) {
            setTitleError("제목을 입력해주세요.");
            valid = false;
        } else {
            setTitleError("");
        }

        if (!description.trim()) {
            setDescriptionError("내용을 입력해주세요.");
            valid = false;
        } else {
            setDescriptionError("");
        }

        if (!startDate || startDate <= new Date()) {
            setDateError("시작 시간은 현재 이후로 설정해주세요.");
            valid = false;
        } else {
            setDateError("");
        }

        return valid;
    };

    const handleSubmit = async () => {
        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);

        try {
            const arenaResult = await fetch(`/api/member/arenas`, {
                method: "POST",
                body: JSON.stringify({
                    title,
                    description,
                    startDate,
                }),
            });
            if (arenaResult.ok) {
                closeModal();
                // 새로고침
                window.location.reload();
            }

            // TODO: get policyId and actualScore from Score Policy Database
            const scoreRecordResult = await fetch(`/api/member/scores`, {
                method: "POST",
                body: JSON.stringify({
                    policyId: 4,
                    actualScore: -100,
                }),
            });
            const scoreRecord = await scoreRecordResult.json();
            if (scoreRecordResult.ok) {
                closeModal();
                console.log("점수 기록 생성 성공:", scoreRecord);
            }
        } catch (error: unknown) {
            console.error("Failed to post arena", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={closeModal}>
            <div className="flex flex-col gap-4">
                {/* ✅ 제목 */}
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                    <span>도전장 작성</span>
                </h2>

                <div className="rounded border border-yellow-600/50 bg-yellow-50/10 px-4 py-2 text-xs text-yellow-500 sm:text-sm">
                    <div className="space-y-1">
                        <div>
                            작성 후 수정이 불가능하니 내용을 신중히
                            작성해주세요.
                        </div>
                        <div>투기장 작성 시 100점의 포인트가 차감됩니다.</div>
                    </div>
                </div>
                {/* ✅ 도전장 제목 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="flex items-center justify-between text-sm text-white">
                        <span>도전장 제목</span>
                        {titleError && (
                            <span className="text-sm text-red-400">
                                {titleError}
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder="토론 주제를 입력하세요"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (titleError) setTitleError("");
                        }}
                        className={`rounded bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400 ${
                            titleError
                                ? "border border-red-500 focus:outline-none"
                                : "border border-zinc-600"
                        }`}
                    />
                </div>

                {/* ✅ 도전 내용 입력 */}
                <div className="flex flex-col gap-1">
                    <label className="flex items-center justify-between text-sm text-white">
                        <span>도전 내용</span>
                        {descriptionError && (
                            <span className="text-sm text-red-400">
                                {descriptionError}
                            </span>
                        )}
                    </label>
                    <textarea
                        placeholder="토론장 내용을 입력하세요"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            if (descriptionError) setDescriptionError("");
                        }}
                        className={`h-48 resize-none rounded bg-zinc-800 px-4 py-2 text-white placeholder-zinc-400 ${
                            descriptionError
                                ? "border border-red-500 focus:outline-none"
                                : "border border-zinc-600"
                        }`}
                    />
                </div>

                {/* ✅ 일정  */}
                <div className="flex flex-col text-black">
                    <label className="mb-2 flex items-center justify-between text-sm text-white">
                        <span>시작 시간</span>
                        {dateError && (
                            <span className="text-sm text-red-400">
                                {dateError}
                            </span>
                        )}
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => {
                            if (date) {
                                setStartDate(date);
                                if (dateError) setDateError("");
                            }
                        }}
                        showTimeSelect
                        timeIntervals={10} // ⏱ 10분 단위
                        timeCaption="시간"
                        dateFormat="yyyy-MM-dd HH:mm"
                        className={`w-full rounded px-4 py-2 ${
                            dateError
                                ? "border border-red-500 bg-red-100/10 text-red-200 focus:outline-none"
                                : "border border-gray-300"
                        }`}
                    />
                </div>

                {/* ✅ 하단 버튼 영역 */}
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={closeModal}
                        type="red"
                        label="취소하기"
                        size="small"
                    />
                    <Button
                        onClick={handleSubmit}
                        label="작성하기"
                        size="small"
                    />
                </div>
            </div>
        </ModalWrapper>
    );
}
