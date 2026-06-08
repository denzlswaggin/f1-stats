import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { cn } from "@/lib/utils";
import { CollectionProvider } from "@/context/CollectionContext";
import { auth } from "@/auth";
import PointsTracker from "./components/PointsTracker";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Stats Hub – Formula 1 Statistics & Live Data",
  description:
    "Real-time Formula 1 statistics, standings, race schedules, and driver comparisons. Powered by live F1 data.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={cn("antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <CollectionProvider isLoggedIn={!!session?.user}>
          <PointsTracker isLoggedIn={!!session?.user} />
          <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
            <Navbar user={session?.user} />
            <main className="main-content">{children}</main>
          </div>
        </CollectionProvider>
      </body>
    </html>
  );
}