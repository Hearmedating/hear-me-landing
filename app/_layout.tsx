import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { I18nProvider } from '../src/lib/i18n';
import { trackPageView } from '../src/lib/analytics';

function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
     if (typeof window !== 'undefined' && !(window as any).gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-316LCDZKZQ';
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function gtag() {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', 'G-316LCDZKZQ');
  }

  trackPageView(pathname || '/');
    trackPageView(pathname || '/');
  }, [pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AnalyticsTracker />
      <Stack screenOptions={{ headerShown: false }} />
    </I18nProvider>
  );
}
