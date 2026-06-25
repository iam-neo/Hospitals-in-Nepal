import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Nepal Health Finder — Find Hospitals, Clinics & Health Posts Near You",
  description:
    "A map-based directory of hospitals, clinics, health posts, and pharmacies across Nepal. Find nearby health facilities, get directions, and access contact information.",
  keywords: [
    "Nepal",
    "hospitals",
    "clinics",
    "health posts",
    "pharmacies",
    "health facilities",
    "healthcare",
    "directory",
  ],
  openGraph: {
    title: "Nepal Health Finder",
    description:
      "Find hospitals, clinics, health posts, and pharmacies across Nepal. Get directions and contact information.",
    type: "website",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        {/* Header */}
        <header className="app-header">
          <Link href="/" className="header-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 2L3 9v10l11 7 11-7V9L14 2z"
                fill="rgba(255,255,255,0.15)"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M14 8a4 4 0 00-4 4c0 4 4 8 4 8s4-4 4-8a4 4 0 00-4-4z"
                fill="white"
                opacity="0.9"
              />
              <circle cx="14" cy="12" r="1.5" fill="#1F4D43" />
            </svg>
            Nepal Health Finder
          </Link>
          <nav className="header-nav">
            <Link href="/">Map</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </header>

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
