import slugify from "slugify";

slugify.extend?.({
  "ğ":"g","Ğ":"g","ü":"u","Ü":"u","ş":"s","Ş":"s","ı":"i","İ":"i","ö":"o","Ö":"o","ç":"c","Ç":"c",
});

export function toSlug(s: string) {
  const out = slugify(s ?? "", { lower: true, strict: true, trim: true, locale: "tr" });
  return out || "icerik";
}

export function randSuffix(n = 6) {
  return Math.random().toString(36).slice(2, 2 + n);
}
