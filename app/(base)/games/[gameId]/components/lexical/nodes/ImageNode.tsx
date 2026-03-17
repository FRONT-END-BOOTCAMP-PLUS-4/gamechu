"use client";

import {
    DecoratorNode,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from "lexical";
import { type JSX } from "react";

export type SerializedImageNode = Spread<
    {
        src: string;
        alt: string;
        width: number;
        type: "image";
        version: 1;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __alt: string;
    __width: number;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__alt, node.__width, node.__key);
    }

    static importJSON(json: SerializedImageNode): ImageNode {
        return new ImageNode(json.src, json.alt, json.width);
    }

    constructor(src: string, alt: string, width: number = 300, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__alt = alt;
        this.__width = width;
    }

    createDOM(): HTMLElement {
        return document.createElement("span");
    }

    updateDOM(): false {
        return false;
    }

    exportJSON(): SerializedImageNode {
        return {
            src: this.__src,
            alt: this.__alt,
            width: this.__width,
            type: "image",
            version: 1,
        };
    }

    decorate(): JSX.Element {
        return (
            <img
                src={this.__src}
                alt={this.__alt}
                width={this.__width}
                style={{ maxWidth: "100%" }}
            />
        );
    }
}

export function $createImageNode(
    src: string,
    alt: string,
    width?: number
): ImageNode {
    return new ImageNode(src, alt, width);
}

export function $isImageNode(
    node: LexicalNode | null | undefined
): node is ImageNode {
    return node instanceof ImageNode;
}
