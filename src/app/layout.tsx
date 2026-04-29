import type { Metadata } from "next";
import { Lora, Lato } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ClientProviders } from "@/components/client-providers";
import { getLang } from "@/lib/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${lora.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ClientProviders initialLang={lang}>
          <Sidebar />
          <main className="min-h-screen pl-64">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
