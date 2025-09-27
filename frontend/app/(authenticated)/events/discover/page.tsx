"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { CalendarDays, Filter } from "lucide-react";
import useEventManager from "@/hooks/useEventManager";

export default function EventsDiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") || "all").toLowerCase();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialCategory);

  useEffect(() => {
    const nextCat = (searchParams.get("category") || "all").toLowerCase();
    setActiveTab(nextCat);
  }, [searchParams]);

  const categories = ["All", "Meetup", "Workshop", "Seminar", "Hackathon", "General"];

  const { events, isLoading, error } = useEventManager();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return (events || []).filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesTab = activeTab === "all" || e.category.toLowerCase() === activeTab;
      return matchesQuery && matchesTab;
    });
  }, [query, activeTab, events]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Discover Events</h1>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by title, location, tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              {categories.map((c) => (
                <TabsTrigger key={c} value={c.toLowerCase()}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center text-muted-foreground">Loading on-chain events...</div>
      )}
      {error && (
        <div className="text-center text-destructive">Failed to load events.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ev) => (
          <EventCard key={ev.id} event={ev} onClick={() => router.push(`/events/${ev.id}`)} />
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground col-span-full">
            No events match your filters.
          </div>
        )}
      </div>
    </div>
  );
}