import { Platform } from "react-native";

export const META_PIXEL_ID = "1747046096657921";

type MetaPixelParams = Record<string, string | number | boolean | null | undefined>;

function canTrackMetaPixel() {
  return Platform.OS === "web" && typeof window !== "undefined" && typeof (window as any).fbq === "function";
}

export function trackMetaLead(params: MetaPixelParams = {}) {
  if (!canTrackMetaPixel()) return;

  (window as any).fbq("track", "Lead", params);
}
