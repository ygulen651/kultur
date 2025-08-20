"use client";
import Image from "next/image";
import Link from "next/link";
import type { UiEvent } from "@/lib/get-events";

export default function EventsRow({ items }: { items: UiEvent[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((ev) => (
        <Link
          href={`/etkinlikler/${ev._id}`}
          key={ev._id}
          className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 group min-h-[220px] bg-gradient-to-br from-red-500/70 to-blue-600/70"
        >
          {/* Arka görsel (çok opak değil) */}
          {ev.computedCover ? (
            <Image
              src={ev.computedCover}
              alt={ev.title}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
              priority={false}
            />
          ) : null}

          {/* Gradient & içerik */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-transparent" />
          <div className="relative z-10 p-5 flex h-full items-end">
            <div>
              <div className="text-xs text-white/80 mb-1">{ev.location}</div>
              <h3 className="text-white font-bold text-lg leading-snug drop-shadow">
                {ev.title}
              </h3>
              {ev.excerpt ? (
                <p className="text-white/80 text-sm line-clamp-2 mt-1">{ev.excerpt}</p>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
