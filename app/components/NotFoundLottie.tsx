"use client";

import Lottie from "lottie-react";
import animationData from "@/public/404.json";

export default function NotFoundLottie() {
  return (
    <div className="w-80 h-80">
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}
