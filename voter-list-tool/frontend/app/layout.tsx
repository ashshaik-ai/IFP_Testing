import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ఓటర్ జాబితా సాధనం",
  description: "Private voter list extraction and review dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="te">
      <body>{children}</body>
    </html>
  );
}
