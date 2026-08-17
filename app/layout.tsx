import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "StayNest — Find your place", template: "%s | StayNest" },
  description: "Premium property booking and management platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('staynest_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
