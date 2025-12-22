"use client";

import React, { useState } from "react";
import StarRating from "@/app/(base)/games/[gameId]/components/StarRating";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CustomImage } from "./extensions/CustomImage";
import { FontSize } from "./extensions/FontSize";
import Placeholder from "@tiptap/extension-placeholder";
import CommentEditorToolbar from "./CommentEditorToolbar";
import TextStyle from "@tiptap/extension-text-style";

interface CommentProps {
    gameId: string;
    editingReviewId?: number;
    defaultValue?: string;
    onSuccess: () => void;
    viewerId?: string | null;
}

export default function Comment({
    gameId,
    editingReviewId,
    defaultValue = "",
    onSuccess,
    viewerId,
}: CommentProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        status: "info" as "success" | "error" | "info",
    });
    const [isLoading, setIsLoading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            CustomImage,
            TextStyle,
            FontSize.configure({ types: ["textStyle"] }),
            Placeholder.configure({ placeholder: "리뷰를 입력하세요..." }),
        ],
        content: defaultValue || null,
        editorProps: {
            attributes: {
                class: "w-full min-h-[218px] sm:min-h-[200px] bg-background-200 rounded-[8px] p-4 outline-none overflow-y-auto border border-line-200 focus:border-primary-purple-200 focus:border-2",
                placeholder: "리뷰를 입력하세요...",
            },
        },
    });

    const handleImageUpload = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    editor
                        ?.chain()
                        .focus()
                        .insertContent([
                            {
                                type: "image",
                                attrs: {
                                    src: reader.result as string,
                                    style: "max-width: 100%; height: auto;", // 반응형 적용
                                },
                            },
                        ])
                        .run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = async () => {
        if (isLoading) return;
        if (!viewerId || typeof viewerId !== "string") {
            setToast({
                show: true,
                message: "로그인이 필요합니다",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
                router.push(
                    `/log-in?callbackUrl=${encodeURIComponent(
                        window.location.pathname
                    )}`
                );
            }, 1000);
            return;
        }

        const html = editor?.getHTML() ?? "";
        if (!html.trim() || rating <= 0) return;

        setIsLoading(true);
        const isEditing = !!editingReviewId;

        try {
            const res = await fetch(
                isEditing
                    ? `/api/member/games/${gameId}/reviews/${editingReviewId}`
                    : `/api/member/games/${gameId}/reviews/`,
                {
                    method: isEditing ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gameId: Number(gameId),
                        content: html,
                        rating: Math.round(rating * 2),
                    }),
                }
            );

            if (!res.ok)
                throw new Error(
                    isEditing ? "리뷰 수정 실패" : "리뷰 등록 실패"
                );

            editor?.commands.setContent("");
            setRating(0);
            onSuccess();
        } catch (err) {
            console.error("리뷰 저장 실패:", err);
            setToast({
                show: true,
                message: "리뷰 저장에 실패했습니다.",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex w-full max-w-full flex-col gap-3 overflow-visible rounded-[4px] bg-background-100 p-4">
            {/* 상단 툴바 + 별점 + 버튼 */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <CommentEditorToolbar
                    editor={editor}
                    onImageUpload={handleImageUpload}
                />
                <div className="flex items-center gap-4">
                    <StarRating
                        value={rating}
                        variant="noText"
                        onChange={setRating}
                    />
                    <Button
                        label={
                            isLoading
                                ? "등록 중.."
                                : editingReviewId
                                  ? "수정"
                                  : "등록"
                        }
                        onClick={handleSubmit}
                    />
                </div>
            </div>

            {/* 에디터 영역 */}
            <EditorContent
                editor={editor}
                className="prose prose-sm sm:prose-base max-w-full break-words [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-primary-blue-200 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md"
            />

            {/* 토스트 */}
            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />
        </div>
    );
}
