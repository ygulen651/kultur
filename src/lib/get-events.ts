import { getBaseUrl } from "./base-url";

export type UiEvent = {
  _id: string;
  title: string;
  excerpt?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  computedCover?: string;
};

export async function getEvents(params?: Record<string, string>) {
  const qs = new URLSearchParams({ ...(params || {}) }).toString();
  const url = `${getBaseUrl()}/api/events${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.items) ? (data.items as UiEvent[]) : [];
}
