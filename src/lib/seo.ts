/**
 * Dynamic SEO & Structured JSON-LD Data Generators
 */

export interface MetaConfig {
  title?: string;
  description?: string;
  ogImage?: string;
  url?: string;
}

export function generateMetaTags(config: MetaConfig = {}) {
  const title = config.title
    ? `${config.title} • LovePixels`
    : "LovePixels • Luxury Discord Community & Creative Circle";
  const description =
    config.description ||
    "A cozy aesthetic Discord server & digital family for voice salons, gaming, art circles, and monthly prize payouts.";
  const ogImage = config.ogImage || "https://lovepixels.vercel.app/og-image.jpg";
  const url = config.url || "https://lovepixels.vercel.app";

  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImage },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LovePixels Community",
    url: "https://lovepixels.vercel.app",
    logo: "https://lovepixels.vercel.app/logo.png",
    sameAs: ["https://discord.gg/lovepixels"],
    description:
      "A luxury aesthetic online community for voice salons, events, gaming, and creator rewards.",
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateEventJsonLd(event: {
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt || event.startsAt,
    image: event.image || "https://lovepixels.vercel.app/og-image.jpg",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: "https://discord.gg/lovepixels",
    },
    organizer: {
      "@type": "Organization",
      name: "LovePixels",
      url: "https://lovepixels.vercel.app",
    },
  };
}
