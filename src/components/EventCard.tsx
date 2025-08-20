'use client';

import Link from 'next/link';

type Props = {
  title: string;
  excerpt?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  cover?: string;
  href?: string;
};

export default function EventCard({ title, excerpt, startAt, location, cover, href = '#' }: Props) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundImage: cover ? `url(${cover})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 220,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-black/20" />
      <div className="relative z-10 p-5 text-white">
        <div className="text-xs opacity-80 mb-2">
          {startAt ? new Date(startAt).toLocaleDateString('tr-TR') : 'Tarih Yakında'}
          {location ? ` • ${location}` : ''}
        </div>
        <h3 className="text-xl font-extrabold mb-1 leading-tight">{title}</h3>
        {excerpt ? <p className="text-sm opacity-90 line-clamp-2">{excerpt}</p> : null}

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm">
          Etkinliğe Git →
        </div>
      </div>
    </Link>
  );
}
