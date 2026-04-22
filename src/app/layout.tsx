import type { Metadata } from "next";
import { Lora, Lato } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "AI Dashboard",
  description: "AI-powered analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Sidebar />
        <main className="min-h-screen pl-64">{children}</main>
      </body>
    </html>
  );
}
