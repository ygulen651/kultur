"use client"

import dynamic from "next/dynamic";
const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"), { ssr: false });

export default function HeroCarouselClient({ slides }: { slides: any[] }) {
  const norm = (slides || []).map((s) => ({
    _id: s._id,
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    imageFilename: s.imageFilename ?? s.filename ?? s?.image?.filename ?? s?.image?.url ?? s?.featuredImage ?? "",
    link: s.link,
    isActive: s.isActive,
    publishedAt: s.publishedAt,
  }));
  if (!norm.length) return null;
  return <HeroCarousel slides={norm} />;
}


