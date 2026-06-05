import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Web-only SEO + OpenGraph meta tag injector for the landing page.
 *
 * Expo Router does not (yet) expose a stable <Head> component on web, so we
 * inject the necessary tags directly into <head> on the client. This is good
 * enough for crawlers that execute JS (Facebook, Twitter, LinkedIn, WhatsApp
 * preview — they all use a runtime evaluator now). For stricter crawlers we
 * can later swap to a custom HTML template via `expo export --platform web`.
 */

type SeoProps = {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName?: string;
  locale?: "en_US" | "fr_FR" | "es_ES";
  twitterHandle?: string;
};

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setLink(rel: string, href: string, sizes?: string) {
  if (typeof document === "undefined") return;
  let tag = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ""}`) as HTMLLinkElement | null;
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    if (sizes) tag.setAttribute("sizes", sizes);
    document.head.appendChild(tag);
  }
  tag.href = href;
}

export function SeoHead({
  title,
  description,
  url,
  image,
  siteName = "HEAR ME",
  locale = "en_US",
  twitterHandle,
}: SeoProps) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    document.title = title;

    // Basic SEO
    setMeta("description", description);
    setMeta("theme-color", "#0B0710");
    setMeta("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");

    // Open Graph (Facebook, LinkedIn, WhatsApp, Instagram link previews)
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:image:alt", `${siteName} — Listen first. Judge later.`, "property");
    setMeta("og:site_name", siteName, "property");
    setMeta("og:locale", locale, "property");

    // Twitter / X cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    if (twitterHandle) setMeta("twitter:site", twitterHandle);

    // Favicon + Apple touch
    setLink("icon", "/assets/assets/images/favicon.png");
    setLink("apple-touch-icon", "/assets/assets/images/hearme-logo.jpg");
    setLink("canonical", url);

    // JSON-LD structured data
    let ld = document.getElementById("ld-json") as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.id = "ld-json";
      ld.type = "application/ld+json";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: siteName,
      url,
      description,
      image,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android, Web",
    });
  }, [title, description, url, image, siteName, locale, twitterHandle]);

  return null;
}
