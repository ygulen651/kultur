"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SliderItem = {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  imageFilename?: string;
  filename?: string;
  image?: { filename?: string; url?: string };
  isActive?: boolean;
  publishedAt?: string | Date;
  order?: number;
  imageUrl?: string; // Yeni eklenen alan
};

type Props = {
  item: SliderItem;
  variant?: "hero" | "wide" | "compact";
  showCTA?: boolean;
  ctaText?: string;
};

function pickImageUrl(item: SliderItem): string | null {
  // Vercel Blob URL'ini öncelikli olarak kullan
  if (item?.imageUrl && item.imageUrl.startsWith('https://')) {
    return item.imageUrl;
  }
  
  // Eski format için geriye uyumluluk
  const fname = item?.imageFilename || item?.image?.filename || "";
  if (!fname || !fname.trim()) return null;
  
  // Eğer zaten tam URL ise kullan
  if (fname.startsWith('http')) {
    return fname;
  }
  
  // Yanlış formatlanmış Cloudinary URL'lerini düzelt
  if (fname.includes('/uploads/https:/res.cloudinary.com/')) {
    const cloudinaryUrl = fname.replace('/uploads/https:/', 'https://');
    return cloudinaryUrl;
  }
  
  // Eski local upload formatı için
  const clean = fname.trim();
  return clean.startsWith("/uploads/") ? clean : `/uploads/${clean}`;
}

function formatTRDate(d?: string | Date) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("tr-TR");
}

export default function SliderCard({
  item,
  variant = "wide",
  showCTA = true,
  ctaText = "Devamını Oku",
}: Props) {
  const src = pickImageUrl(item);
  const dateStr = formatTRDate(item?.publishedAt);
  const activeBadge = item?.isActive ? "🚀 Aktif" : "⏸ Pasif";

  if (variant === "hero") {
    return (
      <Card className="relative overflow-hidden border-0 rounded-2xl shadow-2xl min-h-[320px] md:min-h-[420px] bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 flex flex-col md:flex-row w-full max-w-5xl mx-auto">
        {/* Görsel blok - solda */}
        <div className="relative w-full md:basis-1/2 md:grow md:shrink-0 min-w-0 h-[240px] md:h-auto md:min-h-[420px] bg-center bg-cover">
          {src ? (
            <Image
              src={src}
              alt={item?.title || "Slider"}
              fill
              unoptimized
              className="object-cover object-center md:rounded-l-2xl md:rounded-tr-none rounded-t-2xl"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20 md:rounded-l-2xl md:rounded-tr-none rounded-t-2xl" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent md:rounded-l-2xl md:rounded-tr-none rounded-t-2xl" />
        </div>
        {/* İçerik - sağda */}
        <CardContent className="relative w-full md:basis-1/2 md:grow min-w-0 p-6 md:p-12 z-10 flex flex-col justify-center md:items-start items-center text-center md:text-left">
          <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6 justify-center md:justify-start">
            <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20 text-base px-4 py-2 font-bold">
              {activeBadge}
            </Badge>
            {dateStr && (
              <div className="inline-flex items-center gap-2 text-white/85 bg-white/10 rounded-full px-4 py-2 text-base font-medium">
                <Calendar className="h-5 w-5" />
                <span>{dateStr}</span>
              </div>
            )}
          </div>
          <h3 className="font-black leading-tight text-2xl md:text-4xl lg:text-5xl mb-3 md:mb-4 drop-shadow-xl break-words">
            {item?.title || "Başlık"}
          </h3>
          {(item?.subtitle || item?.description) && (
            <p className="mb-6 md:mb-8 text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl line-clamp-3 drop-shadow">
              {item.subtitle || item.description}
            </p>
          )}
          {showCTA && item?.link && (
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 text-lg font-bold px-8 py-4 rounded-xl shadow-xl mt-2 md:mt-4">
              <Link href={item.link}>{ctaText} →</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Diğer varyantlar için mevcut haliyle devam
  const base =
    "relative overflow-hidden border-0 rounded-2xl shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900";
  const h =
    variant === "wide" ? "min-h-[320px]" : "min-h-[220px]";

  return (
    <Card className={`${base} ${h}`}>
      <div className="relative h-full">
        {/* Görsel arkaplan */}
        <div className="absolute inset-0">
          {src ? (
            <Image
              src={src}
              alt={item?.title || "Slider"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
        </div>
        {/* İçerik */}
        <CardContent className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20">
              {activeBadge}
            </Badge>
            {dateStr ? (
              <div className="inline-flex items-center gap-2 text-white/85 bg-white/10 rounded-full px-3 py-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">{dateStr}</span>
              </div>
            ) : null}
          </div>
          <h3
            className={`font-black leading-tight ${
              variant === "wide"
                ? "text-2xl md:text-3xl"
                : "text-xl md:text-2xl"
            }`}
          >
            {item?.title || "Başlık"}
          </h3>
          {(item?.subtitle || item?.description) && (
            <p className="mt-3 md:mt-4 text-white/90 max-w-3xl line-clamp-2 md:line-clamp-3">
              {item.subtitle || item.description}
            </p>
          )}
          {showCTA && item?.link && (
            <div className="mt-5">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                <Link href={item.link}>{ctaText} →</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
