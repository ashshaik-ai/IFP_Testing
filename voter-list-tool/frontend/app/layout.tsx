import type { Metadata } from "next";
import { Inter, Noto_Sans_Telugu } from "next/font/google";
import "./styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-tel",
});

export const metadata: Metadata = {
  title: "IFP Premium Voter Desk",
  description: "Islamic Front premium private voter extraction and review dashboard",
  icons: {
    icon: "/if-logo-emblem.png",
    shortcut: "/if-logo-emblem.png",
    apple: "/if-logo-emblem.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="te" className={`${notoTelugu.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
