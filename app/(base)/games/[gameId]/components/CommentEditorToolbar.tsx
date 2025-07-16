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
        "px-2 py-1 text-sm rounded hover:bg-primary-purple-100 transition cursor-pointer";

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
        <div className="flex items-center gap-2 rounded">
            {/* Bold */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`${baseStyle} ${
                    editor.isActive("bold")
                        ? "bg-primary-purple-200 text-white"
                        : ""
                }`}
            >
                <Bold size={20} />
            </button>

            {/* Italic */}
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`${baseStyle} ${
                    editor.isActive("italic")
                        ? "bg-primary-purple-200 text-white"
                        : ""
                }`}
            >
                <Italic size={20} />
            </button>
            {/* Font Size: 12px */}
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
                className={`${baseStyle} ${
                    editor.isActive("fontSize", { size: "12" })
                        ? "bg-primary-purple-200 text-white"
                        : ""
                }`}
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
                className={`${baseStyle} ${
                    editor.isActive("fontSize", { size: "24" })
                        ? "bg-primary-purple-200 text-white"
                        : ""
                }`}
            >
                24px
            </button>

            {/* Image Upload */}
            <button onClick={onImageUpload} className={baseStyle}>
                <ImageIcon size={20} />
            </button>

            {/* Image Resize Buttons */}
            <button
                onClick={() => adjustImageWidth(+50)}
                className={`${baseStyle} text-lg`}
            >
                <Plus size={18} />
            </button>
            <button
                onClick={() => adjustImageWidth(-50)}
                className={`${baseStyle} text-lg`}
            >
                <Minus size={18} />
            </button>

            {/* Clear Editor */}
            <button
                onClick={() => editor.commands.setContent("")}
                className={`${baseStyle} text-red-400 hover:bg-red-100`}
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
}
