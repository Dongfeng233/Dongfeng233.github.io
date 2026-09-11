import "./globals.css";
import "lxgw-wenkai-webfont/lxgwwenkai-regular.css";
import "lxgw-wenkai-webfont/lxgwwenkai-bold.css";
import dynamic from "next/dynamic";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "../components/providers";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import siteMetadata from "../../data/sitemetadata";
import UmamiAnalytics from "../components/umami-analytics";
import ThemeStyle from "../components/theme-style";

const ImageLightbox = dynamic(() => import("../components/ImageLightbox"));

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  generator: "Next.js",
  applicationName: siteMetadata.siteRepo,
  referrer: "origin-when-cross-origin",
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author, url: "/about" }],
  creator: siteMetadata.author,
  publisher: siteMetadata.publishName,
  title: siteMetadata.title,
  description: siteMetadata.description,
  icons: {
    icon: siteMetadata.favicon,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss",
      "application/atom+xml": "/atomfeed",
      "application/feed+json": "/jsonfeed",
    },
  },
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.language,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang={siteMetadata.language}
      suppressHydrationWarning
      className={jetbrainsMono.variable}
    >
      <head>
        <ThemeStyle />
      </head>
      <body className="mx-auto bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <div className="max-w-7xl mx-auto px-6">
            <main>{children}</main>
            <Footer />
          </div>
          <ImageLightbox />
        </Providers>
        <UmamiAnalytics />
      </body>
    </html>
  );
}
