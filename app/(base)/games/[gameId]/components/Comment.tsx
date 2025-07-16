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
            FontSize.configure({
                types: ["textStyle"], // FontSize는 이거 필요
            }),
            Placeholder.configure({
                placeholder: "리뷰를 입력하세요...",
            }),
        ],

        content: defaultValue || null,
        editorProps: {
            attributes: {
                class: " w-full min-h-[218px] bg-background-200 rounded-[8px] p-4 outline-none overflow-y-auto border border-line-200 focus:border-primary-purple-200 focus:border-2",
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
                                    width: "300",
                                },
                            },
                        ])
                        .run();
                };
                reader.readAsDataURL(file); // base64
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
        <div className="w-[1060px] min-h-[250px] bg-background-100 rounded-[4px] p-4 flex flex-col gap-3 relative">
            {/* 상단 툴바 + 별점 + 버튼 */}
            <div className="flex justify-between items-center w-full">
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
<<<<<<< HEAD
            <div className="absolute bottom-4 right-4">
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
=======

            {/* 에디터 영역 */}
            <EditorContent
                editor={editor}
                className="prose max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:max-w-full [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-primary-blue-200"
            />

            {/* 토스트 */}
>>>>>>> 73c5c50 ([refactor/#185] textEditor 및 자잘한 수정)
            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />
        </div>
    );
}
