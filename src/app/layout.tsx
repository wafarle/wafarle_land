import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import SEOHead from "@/components/SEOHead";
import { NotificationManager } from "@/components/NotificationManager";
import PWAProvider from "@/components/PWAProvider";
import UpdateChecker from "@/components/UpdateChecker";
import CustomizationProvider from "@/components/CustomizationProvider";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { CustomerNotificationProvider } from "@/contexts/NotificationContext";
import StoreLicenseProtection from "@/components/StoreLicenseProtection";

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
            <CustomizationProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CustomerNotificationProvider>
                      <SEOHead />
                      <StoreLicenseProtection>
                        <MaintenanceWrapper>
                          {children}
                        </MaintenanceWrapper>
                      </StoreLicenseProtection>
                      <PWAProvider />
                      <AnalyticsProvider />
                      <NotificationManager />
                      <UpdateChecker />
                    </CustomerNotificationProvider>
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </CustomizationProvider>
          </CurrencyProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
