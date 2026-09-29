import "./globals.css";

import { Inter, Hind_Siliguri, Amiri } from "next/font/google";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AppToaster from "../components/ui/Toaster";
import FloatingDock from "../components/floating/FloatingDock";
import { AuthProvider } from "../context/AuthContext";
import { I18nProvider } from "../components/providers/I18nProvider";
import { SITE } from "../data/siteData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const viewport = {
  themeColor: "#1b4332",
};

export const metadata = {
  title: {
    default: `${SITE.name} — Online Quran Classes`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Quran classes",
    "online Quran learning",
    "Tajweed",
    "Hifz",
    "Nazra",
    "Masnoon Duas",
    "Hafiz ul Quran",
    SITE.name,
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${hindSiliguri.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AppToaster />
            <FloatingDock />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
