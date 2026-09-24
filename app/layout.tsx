import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synky Líderes | Desenvolvimento que acontece no trabalho",
  description: "Experiências de liderança, comunicação e carreira que transformam percepções em ações práticas.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
