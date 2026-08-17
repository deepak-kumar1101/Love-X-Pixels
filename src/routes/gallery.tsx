import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Image as ImageIcon } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { LightboxModal, downloadImage } from "@/components/site/LightboxModal";
import { galleryItems } from "@/content/placeholders";
import { subscribeToCollection } from "@/lib/firebase";
import type { GalleryItem } from "@/types/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — LovePixels" },
      {
        name: "description",
        content:
          "The seasonal LovePixels gallery: member photography, illustration and film stills curated four times a year.",
      },
      { property: "og:title", content: "Gallery — LovePixels" },
      {
        property: "og:description",
        content: "Member photography, illustration and film stills, curated seasonally.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | undefined>();

  useEffect(() => {
    const unsub = subscribeToCollection<GalleryItem>("gallery", galleryItems, setItems);
    return () => unsub();
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  return (
    <>
      <LightboxModal
        src={lightboxSrc}
        caption={lightboxCaption}
        onClose={() => setLightboxSrc(null)}
      />

      <PageHeader
        eyebrow="Community Gallery"
        title="Made by members"
        description="A rolling exhibition of artwork, VC moments, screenshots, and event memories shared across LovePixels."
      />

      <Section className="pt-0">
        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { id: "all", label: "All Works" },
            { id: "events", label: "Events" },
            { id: "vc", label: "VC Moments" },
            { id: "funny", label: "Community Moments" },
            { id: "announcements", label: "Announcements" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-rose-500 text-white shadow-md"
                  : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="glass-strong my-8 rounded-4xl p-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
              <ImageIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">
              No Gallery Media Available
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
              No gallery items or community artwork have been uploaded yet. Server administrators can upload and manage gallery media from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, i) => (
              <Reveal
                key={item.id}
                delay={i * 0.06}
                className={
                  item.span === "tall" ? "row-span-2" : item.span === "wide" ? "sm:col-span-2" : ""
                }
              >
                <figure
                  onClick={() => {
                    setLightboxSrc(item.src);
                    setLightboxCaption(item.caption || item.alt);
                  }}
                  className="group relative h-full cursor-pointer overflow-hidden rounded-4xl border border-border/70 shadow-sm transition-all hover:shadow-xl"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />

                  {/* Direct Card Download Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(
                        item.src,
                        `${(item.caption || item.alt).toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`
                      );
                    }}
                    title="Download Image"
                    className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-xs font-semibold text-white/90 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-rose-500 hover:text-white group-hover:opacity-100 shadow-md cursor-pointer hover:scale-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>

                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 py-5 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {item.caption || item.alt}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section className="pt-0">
        <Reveal>
          <div className="glass-strong rounded-4xl px-8 py-12 text-center sm:px-14">
            <h2 className="font-serif text-3xl text-balance sm:text-4xl">
              Submissions Open Every Season
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Share your photography, vector art, writing clips or game moments in{" "}
              <code className="rounded bg-rose-500/10 px-2 py-1 text-rose-500">・🍁┆media</code> on
              Discord.
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
