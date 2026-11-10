import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "WhiteboardOS — AI Sketch to Code Intelligence",
  description: "Upload wireframes, whiteboard photos, or hand-drawn sketches. Get live, interactive prototypes powered by AI Vision and the Liquid Glass design system.",
  keywords: ["AI", "sketch to code", "wireframe", "prototype", "Gemini", "vision", "WhiteboardOS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
