import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: "300",
                parseHTML: (el) => el.getAttribute("width"),
                renderHTML: (attrs) => ({
                    width: attrs.width,
                }),
            },
        };
    },
});
