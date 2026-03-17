"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createCommand, COMMAND_PRIORITY_EDITOR, $insertNodes } from "lexical";
import { useEffect } from "react";
import { $createImageNode, ImageNode } from "../nodes/ImageNode";

export const INSERT_IMAGE_COMMAND = createCommand<{
    src: string;
    alt: string;
    width?: number;
}>("INSERT_IMAGE_COMMAND");

interface ImagePluginProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ImagePlugin({ inputRef }: ImagePluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error("ImagePlugin: ImageNode not registered on editor");
        }

        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                const imageNode = $createImageNode(
                    payload.src,
                    payload.alt,
                    payload.width ?? 300
                );
                $insertNodes([imageNode]);
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    const handleFileChange = () => {
        const file = inputRef.current?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: reader.result as string,
                alt: file.name,
                width: 300,
            });
        };
        reader.readAsDataURL(file);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
        />
    );
}
