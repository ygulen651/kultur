"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AnnouncementItem {
  _id?: string;
  id?: string;
  title?: string;
  publishDate?: string;
  frontmatter?: {
    date?: string;
    image?: string;
    featuredImage?: string;
  };
  image?: string;
  featuredImage?: string;
  imageUrl?: string;
  coverImage?: string;
}

interface SmallAnnouncementSliderProps {
  announcements: AnnouncementItem[];
}

function getImageUrl(item: AnnouncementItem): string | null {
  return (
    item?.image ||
    item?.featuredImage ||
    item?.imageUrl ||
    item?.frontmatter?.image ||
    item?.frontmatter?.featuredImage ||
    item?.coverImage ||
    null
  );
}

function getTitle(item: AnnouncementItem): string {
  return item?.title || "Duyuru";
}

function safeDate(date?: string): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function SmallAnnouncementSlider({ announcements }: SmallAnnouncementSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = announcements.slice(0, 5);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000); // 4 saniyede bir değiş

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  if (slides.length === 0) {
    return (
      <div className="relative h-[400px] lg:h-full overflow-hidden rounded-t-2xl lg:rounded-tl-2xl bg-gray-800 shadow-xl flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Duyuru Bulunamadı</h1>
          <p className="text-lg opacity-80">Henüz yayınlanmış duyuru bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-[400px] lg:h-full overflow-hidden rounded-t-2xl lg:rounded-tl-2xl bg-gray-800 shadow-xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slider Container */}
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((item, index) => {
          const imageUrl = getImageUrl(item);
          const href = `/duyurular/${item?.slug || item?._id || item?.id || "#"}`;
          return (
            <Link key={item?._id || item?.id || index} href={href} className="min-w-full h-full relative block group">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={getTitle(item)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index === 0}
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/60 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />
              
              {/* Content - Sadece alt kısımda yazı */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 text-white">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 group-hover:bg-black/70 transition-colors duration-300">
                  <h1 className="text-sm md:text-lg font-black mb-1 line-clamp-2 drop-shadow-lg leading-tight">
                    {getTitle(item)}
                  </h1>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold opacity-95">
                      {safeDate(item?.publishDate || item?.frontmatter?.date)}
                    </p>
                    <p className="text-xs font-medium opacity-90">
                      {index + 1} / {slides.length}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all"
            aria-label="Önceki duyuru"
          >
            ‹
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-6 h-6 md:w-8 md:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all"
            aria-label="Sonraki duyuru"
          >
            ›
          </button>
        </>
      )}
      
      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white/80' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Duyuru ${index + 1}'e git`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
