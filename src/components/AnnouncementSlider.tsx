"use client";

import Image from "next/image";
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

interface AnnouncementSliderProps {
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
  return item?.title || "Slider";
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

export default function AnnouncementSlider({ announcements }: AnnouncementSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = announcements.slice(0, 5);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // 5 saniyede bir değiş

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Manuel geçişte auto-play'i durdur
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
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Duyuru Bulunamadı</h1>
          <p className="text-lg opacity-80">Henüz yayınlanmış duyuru bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
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
          return (
            <div key={item?._id || item?.id || index} className="min-w-full h-full relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={getTitle(item)}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-8 max-w-4xl">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-lg">
                    {getTitle(item)}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 drop-shadow-lg">
                    {safeDate(item?.publishDate || item?.frontmatter?.date)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors z-10"
            aria-label="Önceki duyuru"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white transition-colors z-10"
            aria-label="Sonraki duyuru"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
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
