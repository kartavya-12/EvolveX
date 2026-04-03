import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvolveX — Level Up Your Life",
  description: "A gamified self-improvement platform. Train your body and mind. Earn XP. Level up.",
  keywords: ["self-improvement", "gamification", "fitness", "productivity", "leveling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
