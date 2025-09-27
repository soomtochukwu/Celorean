"use client";

import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO Date
  time?: string; // HH:mm
  location: string;
  category: string;
  price?: string; // e.g. "Free" or "$10"
  image?: string;
  organizer?: string;
  attendeesCount?: number;
  isPublished?: boolean;
  tags?: string[];
};

export function EventCard({ event, className, onClick }: { event: EventItem; className?: string; onClick?: () => void }) {
  // Use stable locale/timezone to prevent hydration mismatch
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(event.date));

  return (
    <Card className={cn("glass border-primary/10 hover:border-primary/30 transition-colors", className)}>
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-40 object-cover rounded-t-md"
          />
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
            {event.isPublished ? (
              <Badge className="text-xs">Published</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Draft</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {dateLabel}
              {event.time ? ` • ${event.time}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          {typeof event.attendeesCount === "number" && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.attendeesCount} attending</span>
            </div>
          )}
          {event.price && (
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>{event.price}</span>
            </div>
          )}
        </div>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClick}>View</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EventCard;