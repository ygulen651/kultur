'use client';

import Link from 'next/link';
import { pickAnnouncementCover } from '@/lib/ui';
import { Image, File } from 'lucide-react';

type Props = {
  item: any;
  href?: string;
  className?: string;
};

export default function AnnouncementCard({ item, href = '#', className = '' }: Props) {
  const src = pickAnnouncementCover(item);

  return (
    <article
      className={[
        'relative overflow-hidden rounded-3xl min-h-[320px]',
        'bg-gradient-to-br from-red-600 via-red-600 to-purple-700',
        'text-white',
        className,
      ].join(' ')}
      style={
        src
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(220,38,38,0.75) 0%, rgba(147,51,234,0.45) 100%), url("${src}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      <div className="relative z-10 p-6 md:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold backdrop-blur">
          <span>DUYURU</span>
          {item?.publishedAt && (
            <span className="opacity-80">
              {new Date(item.publishedAt).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>

        <h3 className="text-3xl md:text-4xl font-black mb-3">
          {item?.title || 'Başlık'}
        </h3>

        <p className="text-white/85 max-w-2xl mb-6">
          {item?.excerpt || 'Açıklama bulunamadı'}
        </p>

        {/* Ek görseller ve dosyalar bilgisi */}
        <div className="flex items-center gap-4 mb-6 text-white/70 text-sm">
          {item?.images && item.images.length > 0 && (
            <div className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              <span>{item.images.length} görsel</span>
            </div>
          )}
          {item?.files && item.files.length > 0 && (
            <div className="flex items-center gap-1">
              <File className="h-4 w-4" />
              <span>{item.files.length} dosya</span>
            </div>
          )}
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30 transition"
        >
          Devamını Oku <span>→</span>
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute w-96 h-96 -top-10 -left-10 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute w-72 h-72 bottom-10 right-10 rounded-full bg-white/10 blur-2xl" />
      </div>
    </article>
  );
}
