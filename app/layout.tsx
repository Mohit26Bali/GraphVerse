import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import "./globals.css";

// Fonts are downloaded at build time and served from this site.
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const description =
  "An interactive platform for exploring mathematical functions through visualization, animation, and experimentation.";

// Resolves relative OG/Twitter image URLs against the real deployed origin instead of
// defaulting to localhost in production. NEXT_PUBLIC_SITE_URL lets any host override it;
// VERCEL_URL is populated automatically on Vercel with no configuration needed.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const viewport: Viewport = {
  themeColor: "#14161a",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "GraphVerse",
  description,
  openGraph: {
    title: "GraphVerse",
    description,
    siteName: "GraphVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraphVerse",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${grotesk.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <Header />
          <div className="flex-1">{children}</div>
        </TooltipProvider>
      </body>
    </html>
  );
}
