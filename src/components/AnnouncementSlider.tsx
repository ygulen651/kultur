"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AnnouncementItem {
  _id?: string;
  id?: string;
  slug?: string;
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
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
      className="mobile-slider relative w-full h-[10vh] min-h-[60px] max-h-[140px] sm:h-[12vh] sm:max-h-[160px] md:h-[14vh] md:max-h-[180px] lg:h-[16vh] lg:max-h-[200px] xl:h-[18vh] xl:max-h-[220px] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Container */}
      <div 
        className="slider-container flex h-full transition-transform duration-500 ease-in-out"
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
                  className="slider-image object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              )}
              
              {/* Overlay - koyulaştırıldı */}
              <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors duration-300" />
              
              {/* Content - Removed text overlay */}
            </Link>
          );
        })}
      </div>
      
      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="nav-button absolute left-1 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 sm:p-2 md:p-3 lg:p-4 text-white transition-colors z-10 touch-manipulation active:scale-95"
            aria-label="Önceki duyuru"
          >
            <svg className="nav-icon w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="nav-button absolute right-1 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 sm:p-2 md:p-3 lg:p-4 text-white transition-colors z-10 touch-manipulation active:scale-95"
            aria-label="Sonraki duyuru"
          >
            <svg className="nav-icon w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="dots-container absolute bottom-1 sm:bottom-2 md:bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 md:space-x-3 lg:space-x-4 z-10">
          {slides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToSlide(index)}
              className={`dot-button w-3 h-3 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-200 touch-manipulation active:scale-90 ${
                index === currentIndex 
                  ? 'bg-white/90 shadow-lg' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Duyuru ${index + 1}'e git`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
