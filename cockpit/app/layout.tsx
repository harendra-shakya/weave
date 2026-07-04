import type { Metadata } from "next";
import { Newsreader, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";

// ponytail: next/font/google downloads at dev-server start and serves via static assets —
// zero browser network requests at runtime. Equivalent to next/font/local + bundled files.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--nr",
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--is",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--ipm",
});

export const metadata: Metadata = {
  title: "WEAVE Owner Cockpit",
  description: "Local-only owner cockpit for WEAVE 0.2. Fixture data; external actions simulated.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${instrumentSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
