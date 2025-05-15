// app/test/button-test/page.tsx
"use client";

import React from "react";
import Button from "@/app/components/Button";

export default function ButtonTestPage() {
    return (
        <div className="min-h-screen bg-background-400 text-font-100 p-10 space-y-6">
            <h1 className="text-headline font-bold">Button 컴포넌트 테스트</h1>

            <div className="space-y-4">
                <h2 className="text-h2 font-semibold">Size 테스트</h2>
                <div className="flex gap-4 flex-wrap">
                    <Button label="XS" size="xs" />
                    <Button label="Small" size="small" />
                    <Button label="Medium" size="medium" />
                    <Button label="Large" size="large" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-h2 font-semibold">Type 테스트</h2>
                <div className="flex gap-4 flex-wrap">
                    <Button label="Purple" type="purple" />
                    <Button label="Blue" type="blue" />
                    <Button label="Black" type="black" />
                    <Button label="Disabled" type="disabled" />
                </div>
            </div>
        </div>
    );
}
