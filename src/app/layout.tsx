import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextMirror | Agent Handoff Compiler",
  description:
    "Turn long conversations into actionable context packs for seamless agent handoffs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
