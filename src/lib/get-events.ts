import { getApi } from "./fetch-api";

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
  try {
    const qs = new URLSearchParams({ ...(params || {}) }).toString();
    const endpoint = `/api/events${qs ? `?${qs}` : ""}`;
    
    const data = await getApi<{ items: UiEvent[] }>(endpoint);
    return Array.isArray(data?.items) ? data.items : [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
