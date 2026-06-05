import { Platform } from "react-native";

export const GA_MEASUREMENT_ID = "G-316LCDZKZQ";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

function canTrack() {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    typeof (window as any).gtag === "function"
  );
}

export function trackPageView(path: string) {
  if (!canTrack()) return;

  (window as any).gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title:
      typeof document !== "undefined" ? document.title : undefined,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackEvent(
  name: string,
  params: AnalyticsParams = {}
) {
  if (!canTrack()) return;

  (window as any).gtag("event", name, params);
}
