import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { I18nProvider } from '../src/lib/i18n';
import { trackPageView } from '../src/lib/analytics';

function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
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
