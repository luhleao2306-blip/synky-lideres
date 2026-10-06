import type { Metadata } from "next";
import "./globals.css";
import "./home-landing.css";

export const metadata: Metadata = {
  title: "Synky Líderes | Desenvolvimento que acontece no trabalho",
  description: "Experiências de liderança, comunicação e carreira que transformam percepções em ações práticas.",
  icons: {
    icon: "/images/brand/synky-leaders-mark.webp",
    shortcut: "/images/brand/synky-leaders-mark.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
