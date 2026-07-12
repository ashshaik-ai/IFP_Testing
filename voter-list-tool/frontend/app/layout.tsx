import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "IFP Voter Desk",
  description: "Islamic Front premium private voter extraction and review dashboard",
  icons: {
    icon: "/if-logo-emblem.png",
    shortcut: "/if-logo-emblem.png",
    apple: "/if-logo-emblem.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="te">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-tel: 'Noto Sans Telugu'; --font-latin: 'Inter'; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
