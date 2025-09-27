"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";

const categories = [
  { name: "Meetup", description: "Casual gatherings and networking", count: 12 },
  { name: "Workshop", description: "Hands-on sessions and tutorials", count: 7 },
  { name: "Seminar", description: "Talks and lectures", count: 5 },
  { name: "Hackathon", description: "Competitive building and collaboration", count: 3 },
];

export default function EventsCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Event Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Card key={c.name} className="glass border-primary/10 hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{c.name}</span>
                <Badge variant="secondary">{c.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{c.description}</p>
              <Link href={`/events/discover?category=${encodeURIComponent(c.name.toLowerCase())}`} className="text-primary inline-flex items-center gap-1">
                Browse {c.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}