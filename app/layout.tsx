// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans bg-background-400 text-font-100">
        {children}
      </body>
    </html>
  );
}
