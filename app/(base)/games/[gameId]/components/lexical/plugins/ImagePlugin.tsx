"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createCommand, COMMAND_PRIORITY_EDITOR, $insertNodes } from "lexical";
import { useEffect } from "react";
import { $createImageNode, ImageNode } from "../nodes/ImageNode";

const INSERT_IMAGE_COMMAND = createCommand<{
    src: string;
    alt: string;
    width?: number;
}>("INSERT_IMAGE_COMMAND");

type ImagePluginProps = {
    inputRef: React.RefObject<HTMLInputElement | null>;
};

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

    // TODO: image inserted via this plugin is visible in the editor immediately,
    // but after save+reload the image may not render correctly until a hard refresh.
    // Likely cause: base64 src stored in Lexical JSON is read back fine, but
    // ReadOnlyReview may need to register ImageNode or handle serialization edge cases.
    // Needs investigation with an actual save→reload cycle.
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
