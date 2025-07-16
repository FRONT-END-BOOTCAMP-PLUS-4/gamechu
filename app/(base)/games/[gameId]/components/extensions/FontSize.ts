import { Mark } from "@tiptap/core";

// <ReturnType> 붙여줘야 체이닝됨
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType;
        };
    }
}

export const FontSize = Mark.create({
    name: "fontSize",

    addAttributes() {
        return {
            size: {
                default: null,
                parseHTML: (el) => el.style.fontSize?.replace("px", ""),
                renderHTML: (attrs) => {
                    if (!attrs.size) return {};
                    return { style: `font-size: ${attrs.size}px` };
                },
            },
        };
    },

    parseHTML() {
        return [{ style: "font-size" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", HTMLAttributes, 0];
    },

    addCommands() {
        return {
            setFontSize:
                (size: string) =>
                ({ chain }) => {
                    return chain().setMark("fontSize", { size }).run();
                },
        };
    },
});
