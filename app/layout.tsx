import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://benrosar.io"),
  title: {
    default: "Ben Rosario | Developer & Cognitive Science Student",
    template: "%s | Ben Rosario",
  },
  description:
    "I’m Ben, a developer in the San Francisco Bay Area studying Cognitive Science at UC Berkeley. Explore my projects, including Sierra Class Helper.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Ben Rosario", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var theme=localStorage.getItem("portfolio-theme");if(theme==="light"||theme==="dark")document.documentElement.dataset.theme=theme}catch{}`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
