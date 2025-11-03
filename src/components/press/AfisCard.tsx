"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

type Props = {
  item: {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    cover?: { url: string; width?: number; height?: number };
  };
};

export default function AfisCard({ item }: Props) {
  const src = item.cover?.url || "/placeholder-wide.jpg";
  return (
    <Link
      href={`/basin-yayin/${item.slug}`}
      className="group block rounded-xl overflow-hidden shadow hover:shadow-xl transition"
    >
      <div className="relative h-64 w-full">
        <Image
          src={src}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority={false}
        />
        {/* Üstte başlık */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <h3 className="absolute bottom-3 left-4 right-4 text-white font-extrabold text-xl drop-shadow">
          {item.title}
        </h3>
      </div>
      {/* Altta kısa yazı */}
      {item.excerpt ? (
        <p className="px-4 py-3 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-800">
          {item.excerpt}
        </p>
      ) : (
        <div className="h-3" />
      )}
    </Link>
  );
}
