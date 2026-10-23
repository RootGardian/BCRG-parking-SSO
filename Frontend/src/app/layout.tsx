import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

// Police Geist
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// Police de marque chargée localement (LaGuinze)
const laGuinze = localFont({
  src: [
    {
      path: "../../public/fonts/LaGuinze_Font/LaGuinze_OTF/LaGuinze-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/LaGuinze_Font/LaGuinze_OTF/LaGuinze-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/LaGuinze_Font/LaGuinze_OTF/LaGuinze-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-laguinze",
  display: "swap",
});

// Police Verdana chargée localement
const verdana = localFont({
  src: [
    {
      path: "../../public/fonts/verdana.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-verdana",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d433b",
};

export const metadata: Metadata = {
  title: "Application Parking BCRG",
  description:
    "Application de gestion et de contrôle d'accès au parking de la Banque Centrale de la République de Guinée",
  applicationName: "Parking BCRG",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parking BCRG",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${laGuinze.variable} ${verdana.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
