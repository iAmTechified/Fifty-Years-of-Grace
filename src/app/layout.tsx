import type { Metadata } from "next";
import { Space_Grotesk, Cormorant_Garamond, Great_Vibes, Libre_Bodoni } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import MobileUnderConstruction from "@/components/MobileUnderConstruction";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const canela = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-canela",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const libreBodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-libre-bodoni",
  display: "swap",
  style: ["normal", "italic"],
});

const betterTogether = localFont({
  src: "./fonts/better-together.regular.otf",
  variable: "--font-better-together",
});

export const metadata: Metadata = {
  title: "Fifty Years of Grace",
  description: "An invitation to honor, reflect, and celebrate a remarkable journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${canela.variable} ${greatVibes.variable} ${libreBodoni.variable} ${betterTogether.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent selection:text-background">
        <div className="md:hidden">
          {/* <MobileUnderConstruction /> */}
        </div>
        <div className="">
          {children}
        </div>
      </body>
    </html>
  );
}
