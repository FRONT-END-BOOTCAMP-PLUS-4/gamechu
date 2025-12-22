"use client";

import { Editor } from "@tiptap/react";
import { Bold, Italic, ImageIcon, Trash2, Plus, Minus } from "lucide-react";

interface Props {
    editor: Editor | null;
    onImageUpload: () => void;
}

export default function CommentEditorToolbar({ editor, onImageUpload }: Props) {
    if (!editor) return null;

    const baseStyle =
        "flex items-center justify-center px-2 py-2 text-sm rounded hover:bg-primary-purple-100 transition cursor-pointer flex-shrink-0";

    const activeStyle = "bg-primary-purple-200 text-white";

    const adjustImageWidth = (delta: number) => {
        const { state } = editor;
        const { selection } = state;

        let imagePos = -1;
        state.doc.descendants((node, pos) => {
            if (
                node.type.name === "image" &&
                pos >= selection.from &&
                pos + node.nodeSize <= selection.to
            ) {
                imagePos = pos;
                return false;
            }
            return true;
        });

        if (imagePos === -1) return;

        const imageNode = state.doc.nodeAt(imagePos);
        if (!imageNode) return;

        const currentWidth = parseInt(imageNode.attrs.width || "300", 10);
        const newWidth = Math.max(50, currentWidth + delta);

        editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(imagePos, undefined, {
                ...imageNode.attrs,
                width: newWidth.toString(),
            });
            return true;
        });
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-1">
                {/* Bold */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`${baseStyle} ${editor.isActive("bold") ? activeStyle : ""}`}
                >
                    <Bold size={20} />
                </button>
                {/* Italic */}
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`${baseStyle} ${editor.isActive("italic") ? activeStyle : ""}`}
                >
                    <Italic size={20} />
                </button>
                {/* Font Size: 12px */}
                <div className="mx-1 h-4 w-[1px] bg-line-200" />
                <button
                    onClick={() => {
                        const isActive = editor.isActive("fontSize", {
                            size: "12",
                        });
                        editor
                            .chain()
                            .focus()
                            .setFontSize(isActive ? "16" : "12")
                            .run();
                    }}
                    className={`${baseStyle} ${editor.isActive("fontSize", { size: "12" }) ? activeStyle : ""}`}
                >
                    12px
                </button>
                {/* Font Size: 24px */}
                <button
                    onClick={() => {
                        const isActive = editor.isActive("fontSize", {
                            size: "24",
                        });
                        editor
                            .chain()
                            .focus()
                            .setFontSize(isActive ? "16" : "24")
                            .run();
                    }}
                    className={`${baseStyle} ${editor.isActive("fontSize", { size: "24" }) ? activeStyle : ""}`}
                >
                    24px
                </button>
            </div>
            {/* Image Upload */}

            <div className="flex items-center gap-2 sm:border-none sm:pt-0">
                <button
                    onClick={onImageUpload}
                    className={`${baseStyle} gap-2 bg-background-200 pr-3`}
                >
                    <ImageIcon size={18} />
                    <span className="text-sm font-medium">사진</span>
                </button>
                {/* Image Resize Buttons */}

                <div className="flex items-center overflow-visible rounded bg-background-200">
                    <button
                        onClick={() => adjustImageWidth(+50)}
                        className={`${baseStyle} hover:bg-primary-purple-100`}
                    >
                        <Plus size={16} />
                    </button>
                    <span className="text-text-400 select-none whitespace-nowrap px-2 py-2 text-sm">
                        크기
                    </span>
                    <button
                        onClick={() => adjustImageWidth(-50)}
                        className={`${baseStyle} hover:bg-primary-purple-100`}
                    >
                        <Minus size={16} />
                    </button>
                </div>

                {/* Clear Editor */}
                <div className="flex-grow sm:hidden" />

                <button
                    onClick={() => editor.commands.setContent("")}
                    className={`${baseStyle} ml-auto text-red-400 hover:bg-red-50 sm:ml-2`}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
}
