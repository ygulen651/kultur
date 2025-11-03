import Image from "next/image";
import { getBaseUrl } from "@/lib/base-url";

function pickCover(it: any) {
  return (
    it.coverUrl || it.cover || it.image?.url || it.fields?.image?.url || it.src || ""
  );
}

export const revalidate = 0;

async function getItem(slug: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/press/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Afiş bulunamadı");
  return res.json();
}

export default async function AfisDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getItem(slug);
  const it = data?.item ?? {};
  const cover = pickCover(it);

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{it.title}</h1>
      {!!cover && (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={cover}
            alt={it.title || "Afiş"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}
      {it.content && (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: it.content }} />
        </div>
      )}
    </article>
  );
}
