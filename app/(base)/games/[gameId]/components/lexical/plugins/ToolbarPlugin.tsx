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
    ImageIcon,
    Trash2,
    Undo,
    Redo,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "32"] as const;

type ToolbarPluginProps = {
    onImageUpload: () => void;
}

export function ToolbarPlugin({ onImageUpload }: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [fontSize, setFontSize] = useState("16");
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

    const handleFontSizeChange = useCallback(
        (size: string) => {
            setFontSize(size);
            editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                if (selection.isCollapsed()) {
                    const anchorNode = selection.anchor.getNode();
                    const topElement = anchorNode.getTopLevelElement();
                    if (topElement) {
                        const fullSelection = topElement.select(
                            0,
                            topElement.getChildrenSize()
                        );
                        $patchStyleText(fullSelection, {
                            "font-size": `${size}px`,
                        });
                    }
                } else {
                    $patchStyleText(selection, { "font-size": `${size}px` });
                }
            });
        },
        [editor]
    );

    const base =
        "flex items-center justify-center p-2 rounded hover:bg-primary-purple-100 transition cursor-pointer flex-shrink-0";
    const active = "bg-primary-purple-200 text-white";

    const noFocus = (e: React.MouseEvent) => e.preventDefault();

    return (
        <div className="flex flex-col gap-2">
            {/* Row 1: text formatting */}
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto whitespace-nowrap">
                <button
                    aria-label="실행 취소"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    className={base}
                >
                    <Undo size={18} />
                </button>
                <button
                    aria-label="다시 실행"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    className={base}
                >
                    <Redo size={18} />
                </button>

                <div className="mx-1 h-4 w-px bg-line-200" />

                <button
                    aria-label="굵게"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                    className={`${base} ${activeFormats.has("bold") ? active : ""}`}
                >
                    <Bold size={18} />
                </button>
                <button
                    aria-label="기울임"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                    className={`${base} ${activeFormats.has("italic") ? active : ""}`}
                >
                    <Italic size={18} />
                </button>
                <button
                    aria-label="밑줄"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                    className={`${base} ${activeFormats.has("underline") ? active : ""}`}
                >
                    <Underline size={18} />
                </button>
                <button
                    aria-label="취소선"
                    onMouseDown={noFocus}
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                    className={`${base} ${activeFormats.has("strikethrough") ? active : ""}`}
                >
                    <Strikethrough size={18} />
                </button>

                <div className="mx-1 h-4 w-px bg-line-200" />

                <button
                    aria-label="제목 1"
                    onMouseDown={noFocus}
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
                    onMouseDown={noFocus}
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
                    onMouseDown={noFocus}
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
                    onMouseDown={noFocus}
                    onClick={() =>
                        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
                    }
                    className={base}
                >
                    <List size={18} />
                </button>
                <button
                    aria-label="번호 매기기 목록"
                    onMouseDown={noFocus}
                    onClick={() =>
                        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
                    }
                    className={base}
                >
                    <ListOrdered size={18} />
                </button>
                <button
                    aria-label="인용구"
                    onMouseDown={noFocus}
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
                    onMouseDown={noFocus}
                    onClick={onImageUpload}
                    className={`${base} gap-1.5 bg-background-200 px-3`}
                >
                    <ImageIcon size={16} />
                    <span className="text-sm font-medium">사진</span>
                </button>

                {/* Clear */}
                <button
                    aria-label="에디터 초기화"
                    onMouseDown={noFocus}
                    onClick={() => {
                        if (
                            window.confirm(
                                "에디터 내용을 모두 삭제하시겠습니까?"
                            )
                        ) {
                            editor.dispatchCommand(
                                CLEAR_EDITOR_COMMAND,
                                undefined
                            );
                            setFontSize("16");
                        }
                    }}
                    className={`${base} ml-auto text-red-400 hover:bg-red-50`}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
