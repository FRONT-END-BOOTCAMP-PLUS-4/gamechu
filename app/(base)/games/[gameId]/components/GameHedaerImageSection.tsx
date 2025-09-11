import Image from "next/image";
interface Props {
    image: string;
    title: string;
}

export default function GameTitleImageSection({ image, title }: Props) {
    return (
        <div className="flex w-full flex-col overflow-visible rounded-3xl shadow lg:flex-row">
            <div className="relative aspect-[12/9] w-full flex-none">
                <Image
                    src={image.startsWith("//") ? `https:${image}` : image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="rounded-3xl lg:rounded-3xl"
                />
            </div>
        </div>
    );
}
