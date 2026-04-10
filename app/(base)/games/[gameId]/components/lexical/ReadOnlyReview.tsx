"use client";

import { useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { sharedNodes } from "./nodes";
import { sharedTheme } from "./SharedTheme";

type ReadOnlyReviewProps = {
    content: string;
};

function isLexicalJson(content: string): boolean {
    try {
        const parsed = JSON.parse(content);
        return typeof parsed?.root === "object" && parsed.root !== null;
    } catch {
        return false;
    }
}

export function ReadOnlyReview({ content }: ReadOnlyReviewProps) {
    const isLexical = useMemo(() => isLexicalJson(content), [content]);
    const config = useMemo(
        () => ({
            namespace: "review-readonly",
            editorState: content,
            editable: false,
            nodes: sharedNodes,
            theme: sharedTheme,
            onError: () => {},
        }),
        [content]
    );

    if (!isLexical) {
        // Fallback: render as plain text for pre-migration HTML reviews or parse errors
        return (
            <p className="prose prose-sm max-w-full break-words text-sm text-font-200">
                {content}
            </p>
        );
    }

    return (
        <LexicalComposer initialConfig={config}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable className="prose prose-sm max-w-full break-words outline-none [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md" />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
            />
        </LexicalComposer>
    );
}
