import { getEvents } from "@/lib/get-events";
import EventsRow from "@/components/EventsRow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
  const events = await getEvents({ published: "true" });
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Etkinliklerimiz</h1>
      {events.length ? <EventsRow items={events} /> : <div>Henüz etkinlik yok.</div>}
    </div>
  );
}
