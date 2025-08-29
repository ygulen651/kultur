import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// PDF indirme için Cloudinary URL'ini düzenle
export const asAttachment = (url: string, name = "dosya.pdf") =>
  url.replace("/raw/upload/", `/raw/upload/fl_attachment:${encodeURIComponent(name)}/`);
