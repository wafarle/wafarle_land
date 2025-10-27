import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import AnalyticsProvider from "@/components/AnalyticsProvider";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "وفرلي - أفضل عروض الاشتراكات",
  description: "وفر على اشتراكاتك المفضلة مع وفرلي. احصل على أفضل العروض لـ Netflix، Spotify، Shahid، والمزيد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased`}>
        <SettingsProvider>
          <CurrencyProvider>
            <MaintenanceWrapper>
              {children}
            </MaintenanceWrapper>
            <AnalyticsProvider />
          </CurrencyProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
