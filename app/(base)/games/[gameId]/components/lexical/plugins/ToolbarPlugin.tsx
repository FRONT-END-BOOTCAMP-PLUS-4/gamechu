"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CLEAR_EDITOR_COMMAND,
    $getSelection,
    $isRangeSelection,
} from "lexical";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $patchStyleText, $getSelectionStyleValueForProperty } from "@lexical/selection";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link,
    ImageIcon,
    Trash2,
    Undo,
    Redo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "32"] as const;

interface ToolbarPluginProps {
    onImageUpload: () => void;
}

export function ToolbarPlugin({ onImageUpload }: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [fontSize, setFontSize] = useState("16");
    const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const linkInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;

                const formats = new Set<string>();
                if (selection.hasFormat("bold")) formats.add("bold");
                if (selection.hasFormat("italic")) formats.add("italic");
                if (selection.hasFormat("underline")) formats.add("underline");
                if (selection.hasFormat("strikethrough")) formats.add("strikethrough");
                setActiveFormats(formats);

                const currentFontSize = $getSelectionStyleValueForProperty(
                    selection,
                    "font-size",
                    "16px"
                );
                setFontSize(currentFontSize.replace("px", "") || "16");
            });
        });
    }, [editor]);

    const handleLinkSubmit = useCallback(() => {
        if (linkUrl && /^https?:\/\//.test(linkUrl)) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
        }
        setIsLinkInputVisible(false);
        setLinkUrl("");
    }, [editor, linkUrl]);

    const handleFontSizeChange = useCallback(
        (size: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, { "font-size": `${size}px` });
                }
            });
        },
        [editor]
    );

    const base =
        "flex items-center justify-center p-2 rounded hover:bg-primary-purple-100 transition cursor-pointer flex-shrink-0";
    const active = "bg-primary-purple-200 text-white";

    return (
        <div className="flex flex-col gap-2">
            {/* Row 1: text formatting */}
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto whitespace-nowrap">
                <button
                    aria-label="실행 취소"
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    className={base}
                >
                    <Undo size={18} />
                </button>
                <button
                    aria-label="다시 실행"
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    className={base}
                >
                    <Redo size={18} />
                </button>

                <div className="mx-1 h-4 w-px bg-line-200" />

                <button
                    aria-label="굵게"
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                    className={`${base} ${activeFormats.has("bold") ? active : ""}`}
                >
                    <Bold size={18} />
                </button>
                <button
                    aria-label="기울임"
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                    className={`${base} ${activeFormats.has("italic") ? active : ""}`}
                >
                    <Italic size={18} />
                </button>
                <button
                    aria-label="밑줄"
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                    className={`${base} ${activeFormats.has("underline") ? active : ""}`}
                >
                    <Underline size={18} />
                </button>
                <button
                    aria-label="취소선"
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                    className={`${base} ${activeFormats.has("strikethrough") ? active : ""}`}
                >
                    <Strikethrough size={18} />
                </button>

                <div className="mx-1 h-4 w-px bg-line-200" />

                <button
                    aria-label="제목 1"
                    onClick={() =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                $setBlocksType(selection, () => $createHeadingNode("h1"));
                            }
                        })
                    }
                    className={base}
                >
                    <Heading1 size={18} />
                </button>
                <button
                    aria-label="제목 2"
                    onClick={() =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                $setBlocksType(selection, () => $createHeadingNode("h2"));
                            }
                        })
                    }
                    className={base}
                >
                    <Heading2 size={18} />
                </button>
                <button
                    aria-label="제목 3"
                    onClick={() =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                $setBlocksType(selection, () => $createHeadingNode("h3"));
                            }
                        })
                    }
                    className={base}
                >
                    <Heading3 size={18} />
                </button>
                <button
                    aria-label="글머리 기호 목록"
                    onClick={() =>
                        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
                    }
                    className={base}
                >
                    <List size={18} />
                </button>
                <button
                    aria-label="번호 매기기 목록"
                    onClick={() =>
                        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
                    }
                    className={base}
                >
                    <ListOrdered size={18} />
                </button>
                <button
                    aria-label="인용구"
                    onClick={() =>
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                $setBlocksType(selection, () => $createQuoteNode());
                            }
                        })
                    }
                    className={base}
                >
                    <Quote size={18} />
                </button>
            </div>

            {/* Row 2: media / utilities */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap">
                {/* Font Size Select */}
                <select
                    aria-label="글자 크기"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                    className="rounded border border-line-200 bg-background-200 px-2 py-1 text-sm"
                >
                    {FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                            {size}px
                        </option>
                    ))}
                </select>

                {/* Image Upload */}
                <button
                    aria-label="사진 업로드"
                    onClick={onImageUpload}
                    className={`${base} gap-1.5 bg-background-200 px-3`}
                >
                    <ImageIcon size={16} />
                    <span className="text-sm font-medium">사진</span>
                </button>

                {/* Link */}
                <div className="relative flex items-center">
                    <button
                        aria-label="링크 삽입"
                        onClick={() => {
                            setIsLinkInputVisible((v) => !v);
                            setTimeout(() => linkInputRef.current?.focus(), 0);
                        }}
                        className={`${base} ${isLinkInputVisible ? active : ""}`}
                    >
                        <Link size={18} />
                    </button>
                    {isLinkInputVisible && (
                        <div className="absolute left-0 top-full z-10 mt-1 flex gap-1">
                            <input
                                ref={linkInputRef}
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleLinkSubmit();
                                    if (e.key === "Escape") {
                                        setIsLinkInputVisible(false);
                                        setLinkUrl("");
                                    }
                                }}
                                placeholder="https://"
                                className="w-48 rounded border border-line-200 bg-background-100 px-2 py-1 text-sm"
                            />
                            <button
                                onClick={handleLinkSubmit}
                                className="rounded bg-primary-purple-200 px-2 py-1 text-sm text-white"
                            >
                                확인
                            </button>
                        </div>
                    )}
                </div>

                {/* Clear */}
                <button
                    aria-label="에디터 초기화"
                    onClick={() => editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)}
                    className={`${base} ml-auto text-red-400 hover:bg-red-50`}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
