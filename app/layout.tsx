import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/constants";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// One sentence that reads well both in search results and as a link-share preview.
const description =
  "Master your Post-UTME with TECHMED AIS — practice thousands of real past questions from Nigerian universities, take timed CBT exams, build daily streaks and climb the leaderboard. Free to start, and it works offline.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.short}`,
  },
  description,
  applicationName: BRAND.short,
  keywords: [
    "Post-UTME",
    "Post UTME past questions",
    "JAMB",
    "CBT practice",
    "Nigerian university admission",
    "TECHMED AIS",
    "exam preparation",
    "aptitude test practice",
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.short,
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description,
    siteName: BRAND.short,
    type: "website",
    locale: "en_NG",
    url: appUrl,
    // The image itself is supplied by app/opengraph-image.tsx (file convention).
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description,
    // Image supplied by app/twitter-image.tsx.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
