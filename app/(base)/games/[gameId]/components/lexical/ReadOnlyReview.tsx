"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { sharedNodes } from "./nodes";
import { sharedTheme } from "./sharedTheme";

interface ReadOnlyReviewProps {
    content: string;
}

export function ReadOnlyReview({ content }: ReadOnlyReviewProps) {
    const config = {
        namespace: "review-readonly",
        editorState: content,
        editable: false,
        nodes: sharedNodes,
        theme: sharedTheme,
        onError: (e: Error) => console.error(e),
    };

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
