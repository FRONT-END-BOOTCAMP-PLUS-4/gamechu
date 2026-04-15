"use client";

import { useMutation } from "@tanstack/react-query";
import ModalWrapper from "@/app/components/ModalWrapper";
import useModalStore from "@/stores/ModalStore";
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
    const [noticeMessage, setNoticeMessage] = useState(
        "작성 후 수정이 불가능하니 내용을 신중히 작성해주세요.\n도전장 작성 시 100포인트가 차감됩니다."
    );
    const [noticeType, setNoticeType] = useState<"normal" | "error">("normal");
    const [shakeKey, setShakeKey] = useState(0);

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

    const { mutate: createArena, isPending } = useMutation({
        mutationFn: async () => {
            const arenaResult = await fetch("/api/member/arenas", {
                method: "POST",
                body: JSON.stringify({ title, description, startDate }),
            });

            if (!arenaResult.ok) {
                const errorData = await arenaResult.json();
                throw new Error(
                    errorData.message || "투기장 생성에 실패했습니다."
                );
            }
        },
        onSuccess: () => {
            closeModal();
            window.location.reload();
        },
        onError: (err) => {
            const message =
                err instanceof Error
                    ? err.message
                    : "투기장 생성에 실패했습니다.";
            setNoticeMessage(message);
            setNoticeType("error");
            setShakeKey((prev) => prev + 1);
        },
    });

    const handleSubmit = () => {
        if (isPending) return;
        if (!validate()) return;
        createArena();
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={closeModal}
            labelId="create-arena-modal-title"
        >
            <div className="flex flex-col gap-4">
                {/* ✅ 제목 */}
                <h2
                    id="create-arena-modal-title"
                    className="flex items-center gap-2 text-xl font-bold text-white"
                >
                    <Image
                        src="/icons/arena2.svg"
                        alt="투기장 아이콘"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                    <span>도전장 작성</span>
                </h2>
                <div
                    key={shakeKey}
                    className={`rounded border px-4 py-2 text-xs sm:text-sm ${
                        noticeType === "error"
                            ? "animate-shake border-red-600/50 bg-red-50/10 text-red-400"
                            : "border-yellow-600/50 bg-yellow-50/10 text-yellow-500"
                    }`}
                >
                    <div className="space-y-1">
                        <div>{noticeMessage}</div>
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
                        timeIntervals={10}
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
                        label={isPending ? "처리 중..." : "작성하기"}
                        size="small"
                        disabled={isPending}
                    />
                </div>
            </div>
        </ModalWrapper>
    );
}
