"use client";

import React, { useRef, useState, useMemo } from "react";
import StarRating from "@/app/(base)/games/[gameId]/components/StarRating";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HEADING } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type LexicalEditor, type EditorState } from "lexical";
import { $getRoot } from "lexical";
import { sharedNodes } from "./lexical/nodes";
import { sharedTheme } from "./lexical/sharedTheme";
import { ToolbarPlugin } from "./lexical/plugins/ToolbarPlugin";
import { ImagePlugin } from "./lexical/plugins/ImagePlugin";
import { AUTOLINK_MATCHERS } from "./lexical/urlMatchers";

type CommentProps = {
    gameId: string;
    editingReviewId?: number;
    defaultValue?: string;
    defaultRating?: number;
    onSuccess: () => void;
    viewerId?: string | null;
}

const MAX_CHARS = 10_000;

/** Sets editorRef on mount so handleSubmit works before any user interaction. */
function EditorRefPlugin({
    editorRef,
}: {
    editorRef: React.MutableRefObject<LexicalEditor | null>;
}) {
    const [editor] = useLexicalComposerContext();
    React.useEffect(() => {
        editorRef.current = editor;
    }, [editor, editorRef]);
    return null;
}

export default function Comment({
    gameId,
    editingReviewId,
    defaultValue = "",
    defaultRating = 0,
    onSuccess,
    viewerId,
}: CommentProps) {
    const router = useRouter();
    const [rating, setRating] = useState(defaultRating);
    const [toast, setToast] = useState({
        show: false,
        message: "",
        status: "info" as "success" | "error" | "info",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const editorRef = useRef<LexicalEditor | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const editorConfig = useMemo(
        () => ({
            namespace: "review-editor",
            nodes: sharedNodes,
            editorState: defaultValue || null,
            onError() {},
            theme: sharedTheme,
        }),
        [defaultValue]
    );

    const handleEditorChange = (
        editorState: EditorState,
        editor: LexicalEditor
    ) => {
        editorRef.current = editor;
        editorState.read(() => {
            const text = $getRoot().getTextContent();
            setCharCount(text.length);
        });
    };

    const handleImageUpload = () => {
        imageInputRef.current?.click();
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

        if (rating <= 0) {
            setToast({
                show: true,
                message: "별점을 선택해주세요",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
            return;
        }

        const editor = editorRef.current;
        if (!editor) return;

        const contentJson = JSON.stringify(editor.getEditorState().toJSON());
        if (!contentJson.trim()) return;

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
                        content: contentJson,
                        rating: Math.round(rating * 2),
                    }),
                }
            );

            if (!res.ok) {
                let serverMessage: string | undefined;
                try {
                    const errData = await res.json();
                    serverMessage = typeof errData?.message === "string" ? errData.message : undefined;
                } catch {
                    // ignore json parse failure
                }
                throw new Error(serverMessage ?? (isEditing ? "리뷰 수정 실패" : "리뷰 등록 실패"));
            }

            setRating(0);
            onSuccess();
        } catch (err) {
            setToast({
                show: true,
                message: err instanceof Error ? err.message : "리뷰 저장에 실패했습니다.",
                status: "error",
            });
            setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const charCountColor =
        charCount >= MAX_CHARS
            ? "text-red-500"
            : charCount >= 9000
              ? "text-yellow-500"
              : "text-font-300";

    return (
        <div className="relative flex w-full max-w-full flex-col gap-3 overflow-visible rounded-[4px] bg-background-100 p-4">
            <LexicalComposer initialConfig={editorConfig}>
                {/* 상단 툴바 + 별점 + 버튼 */}
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <ToolbarPlugin onImageUpload={handleImageUpload} />
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4">
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
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="prose prose-sm min-h-[218px] w-full max-w-full overflow-y-auto break-words rounded-[8px] border border-line-200 bg-background-200 p-4 outline-none focus:border-2 focus:border-primary-purple-200 sm:min-h-[200px] [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md" />
                        }
                        placeholder={
                            <div className="pointer-events-none absolute left-4 top-4 select-none text-sm text-font-300">
                                리뷰를 입력하세요...
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>

                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin validateUrl={(url) => /^https?:\/\//.test(url)} />
                <ClearEditorPlugin />
                <AutoLinkPlugin matchers={AUTOLINK_MATCHERS} />
                <OnChangePlugin onChange={handleEditorChange} />
                <ImagePlugin inputRef={imageInputRef} />
                <EditorRefPlugin editorRef={editorRef} />
                <MarkdownShortcutPlugin transformers={[HEADING]} />
            </LexicalComposer>

            {/* 글자 수 표시 */}
            <div className="flex justify-end">
                <span className={`text-xs ${charCountColor}`}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
            </div>

            {/* 토스트 */}
            <Toast
                show={toast.show}
                status={toast.status}
                message={toast.message}
            />
        </div>
    );
}
