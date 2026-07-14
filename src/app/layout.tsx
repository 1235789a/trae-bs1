import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContextMirror｜智能体上下文交接编译器",
  description:
    "将长对话、需求文档和项目记录，编译成可追溯、可执行、可交接的上下文包。",
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
