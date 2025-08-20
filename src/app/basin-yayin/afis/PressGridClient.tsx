"use client";

import Image from "next/image";
import Link from "next/link";

export default function PressGridClient({ items }: { items: any[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border p-10 text-center text-muted-foreground">
        Henüz içerik yok.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const cover =
          it.coverUrl || it.image?.url || it.featuredImageUrl || "/placeholder.svg";

        return (
          <Link
            key={it._id}
            href={`/basin-yayin/${it.slug || it._id}`}
            className="group overflow-hidden rounded-xl border hover:shadow-md transition"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={cover}
                alt={it.title || "Basın-Yayın"}
                fill
                className="object-cover"
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                priority={false}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold group-hover:text-primary">
                {it.title}
              </h3>
              {!!it.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {it.excerpt}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
