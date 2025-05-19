declare module "lottie-react" {
    import { ComponentType } from "react";

    interface LottieProps {
        animationData: any;
        loop?: boolean;
        autoplay?: boolean;
        className?: string;
        style?: React.CSSProperties;
    }

    const Lottie: ComponentType<LottieProps>;
    export default Lottie;
}
