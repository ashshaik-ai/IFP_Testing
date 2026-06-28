import type { Metadata } from "next";
import "./styles.css";

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
    <html lang="te">
      <body>{children}</body>
    </html>
  );
}
