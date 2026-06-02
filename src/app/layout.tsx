import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "لِگال‌هاب | مشاوره حقوقی تخصصی آنلاین - وکلای برتر ایران",
  description: "مشاوره حقوقی تخصصی تلفنی، چتی، ویدئویی و حضوری. اولین مشاوره رایگان. تیم وکلای متخصص در تمامی حوزه‌های حقوقی. ثبت‌نام آنلاین و رزرو نوبت فوری.",
  keywords: ["مشاوره حقوقی", "وکیل آنلاین", "وکالت", "مشاوره تلفنی", "مشاوره ویدئویی", "حقوقی", "کیفری", "خانواده", "تجاری", "ملکی", "لِگال‌هاب", "LegalHub"],
  openGraph: {
    title: "لِگال‌هاب | مشاوره حقوقی تخصصی آنلاین",
    description: "اولین مشاوره رایگان. مشاوره تلفنی، چتی، ویدئویی و حضوری با وکلای برتر ایران.",
    type: "website",
    locale: "fa_IR",
    siteName: "لِگال‌هاب",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
