import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { SiteShell } from "@/components/site-shell";
import { siteProfile } from "@/lib/site-content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "XJ / Frontend Systems",
    template: "%s",
  },
  description:
    "A calm and professional technical portfolio built with Next.js, Prisma, PostgreSQL and Docker.",
  keywords: [
    "Frontend Engineer",
    "Next.js",
    "Prisma",
    "PostgreSQL",
    "Technical Portfolio",
    "Engineering",
  ],
  openGraph: {
    title: "XJ / Frontend Systems",
    description:
      "A professional personal site for showcasing architecture thinking, engineering depth and technical storytelling.",
    url: "/",
    siteName: "XJ / Frontend Systems",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <html lang="zh-CN" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="relative min-h-full flex flex-col bg-transparent">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "XJ / Frontend Systems",
              url: siteUrl,
              description: metadata.description,
            },
            {
              "@context": "https://schema.org",
              "@type": "Person",
              name: siteProfile.name,
              jobTitle: siteProfile.title,
              description: siteProfile.summary,
              url: siteUrl,
              knowsAbout: siteProfile.focus,
            },
          ]}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
