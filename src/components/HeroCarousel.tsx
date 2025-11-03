"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

type Slide = {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  isActive?: boolean;
  publishedAt?: string | Date;
  imageUrl?: string;
  imageFilename?: string;
  filename?: string;
  image?: { url?: string; filename?: string };
  featuredImage?: string;
  focalX?: number;
  focalY?: number;
};

function pickSrc(s: Slide): string | null {
  const raw =
    s?.imageUrl ||
    s?.imageFilename ||
    s?.filename ||
    s?.image?.filename ||
    s?.image?.url ||
    s?.featuredImage ||
    "";
  if (!raw.trim()) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/uploads/") ? raw : `/uploads/${raw}`;
}

function fmtDate(d?: string | Date) {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t.getTime()) ? "" : t.toLocaleDateString("tr-TR");
}

export default function HeroCarousel({
  slides,
  autoPlayMs = 6000,
}: {
  slides: Slide[];
  autoPlayMs?: number;
}) {
  const list = Array.isArray(slides) ? slides : [];
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const n = list.length;

  React.useEffect(() => {
    if (!n || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), autoPlayMs);
    return () => clearInterval(id);
  }, [n, paused, autoPlayMs]);

  const startX = React.useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    const TH = 40;
    if (dx > TH) prev();
    else if (dx < -TH) next();
    startX.current = null;
  };

  const next = () => setIndex((i) => (i + 1) % n);
  const prev = () => setIndex((i) => (i - 1 + n) % n);

  if (!n) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Slider"
      className="relative w-full overflow-hidden rounded-3xl border border-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Şerit: slaytlar yan yana */}
      <div
        className="flex transition-transform duration-700 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {list.map((s, i) => {
          const src = pickSrc(s);
          const objPos =
            s?.focalX != null && s?.focalY != null
              ? `${s.focalX}% ${s.focalY}%`
              : "center 20%";

          return (
            <article
              key={s._id || i}
              className="relative shrink-0 w-full min-h-[64vh] md:min-h-[72vh] xl:min-h-[78vh] md:aspect-[16/7] xl:aspect-[21/9]"
            >
              {src ? (
                <Image
                  src={src}
                  alt={s.title || "Slider görseli"}
                  fill
                  priority={i === index}
                  className="object-cover"
                  style={{ objectPosition: objPos }}
                  quality={90}
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              )}

              {/* Okunabilir overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.25),transparent)]" />

              {/* Metin katmanı */}
              <div className="relative z-10 h-full w-full px-6 md:px-12 py-10 md:py-16 grid grid-cols-12">
                <div className="col-span-12 md:col-span-7 lg:col-span-6 self-center">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white text-xs font-semibold backdrop-blur">
                    <span>{s.isActive ? "Aktif" : "Pasif"}</span>
                    {s.publishedAt ? (
                      <span className="opacity-80">• {fmtDate(s.publishedAt)}</span>
                    ) : null}
                  </div>

                  <h2 className="text-white font-black leading-[1.05] tracking-tight text-[clamp(2rem,6vw,4.5rem)] drop-shadow-[0_4px_20px_rgba(0,0,0,.35)]">
                    {s.title}
                  </h2>

                  {s.subtitle ? (
                    <p className="mt-3 text-white/90 text-lg md:text-xl">{s.subtitle}</p>
                  ) : null}

                  {s.description ? (
                    <p className="mt-4 max-w-3xl text-white/80 text-base md:text-lg leading-7">
                      {s.description}
                    </p>
                  ) : null}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {s.link ? (
                      <Link
                        href={s.link}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-6 py-3 font-semibold shadow-md hover:shadow-lg transition"
                      >
                        Devamını Oku <span>→</span>
                      </Link>
                    ) : null}
                    <Link
                      href="/duyurular"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 text-white px-6 py-3 font-semibold backdrop-blur hover:bg-white/20 transition"
                    >
                      Tüm Duyurular <span>ℹ</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Oklar */}
      <button
        aria-label="Önceki"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur border border-white/20"
      >
        ‹
      </button>
      <button
        aria-label="Sonraki"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur border border-white/20"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slayt ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              index === i ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
