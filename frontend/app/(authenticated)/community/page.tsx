"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Award,
  BookOpen,
  MessageSquare,
  Filter,
  ChevronDown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useAccount } from "wagmi";

// Mock data for learners
const learners = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 5,
    badges: 12,
    courses: 8,
    specialty: "Blockchain Development",
    walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    isVerified: true,
    isOnline: true,
  },
  {
    id: 2,
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 7,
    badges: 18,
    courses: 10,
    specialty: "Smart Contract Security",
    walletAddress: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a",
    isVerified: true,
    isOnline: false,
  },
  {
    id: 3,
    name: "Michael Rivera",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 4,
    badges: 9,
    courses: 6,
    specialty: "DeFi Applications",
    walletAddress: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b",
    isVerified: true,
    isOnline: true,
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 6,
    badges: 15,
    courses: 9,
    specialty: "Web3 Frontend",
    walletAddress: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c",
    isVerified: true,
    isOnline: false,
  },
  {
    id: 5,
    name: "David Kim",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 8,
    badges: 22,
    courses: 12,
    specialty: "Zero-Knowledge Proofs",
    walletAddress: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d",
    isVerified: true,
    isOnline: true,
  },
  {
    id: 6,
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=80&width=80",
    level: 3,
    badges: 7,
    courses: 4,
    specialty: "Blockchain Fundamentals",
    walletAddress: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1a2b3c4d5e",
    isVerified: false,
    isOnline: false,
  },
];

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("level");

  const { address, isConnected } = useAccount();

  // Messages state
  const [msgContent, setMsgContent] = useState("");
  const [msgPrivate, setMsgPrivate] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [posting, setPosting] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  // Filter and sort learners
  const filteredLearners = learners
    .filter((learner) => {
      if (filter === "verified" && !learner.isVerified) return false;
      if (filter === "online" && !learner.isOnline) return false;
      return (
        learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        learner.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "level") return b.level - a.level;
      if (sortBy === "courses") return b.courses - a.courses;
      if (sortBy === "badges") return b.badges - a.badges;
      return 0;
    });

  async function fetchMessages(nextOffset = 0) {
    try {
      setLoadingMsgs(true);
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(nextOffset),
      });
      if (address) params.set("viewer", address);
      const res = await fetch(`/api/community/messages?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
      const data = await res.json();
      setMessages(nextOffset === 0 ? data.items : [...messages, ...data.items]);
      setHasMore(Boolean(data?.pagination?.hasMore));
      setOffset(nextOffset);
    } catch (e) {
      // noop for now; could add toast
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function postMessage() {
    if (!isConnected || !address) return;
    if (!msgContent.trim()) return;
    try {
      setPosting(true);
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: msgContent.trim(),
          authorAddress: address,
          isPrivate: msgPrivate,
        }),
      });
      if (!res.ok) throw new Error(`Failed to post message: ${res.status}`);
      setMsgContent("");
      setMsgPrivate(false);
      // reload from beginning to see newest first
      await fetchMessages(0);
    } catch (e) {
      // noop for now; could add toast
    } finally {
      setPosting(false);
    }
  }

  useEffect(() => {
    // reload messages when address changes (affects private visibility)
    fetchMessages(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function formatDate(iso?: string) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">
          Connect with other learners in the Celorean ecosystem
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            className="pl-10 glass border-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-primary/20">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Learners
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("verified")}>
              Verified Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("online")}>
              Currently Online
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Sort By
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-primary/20">
            <DropdownMenuItem onClick={() => setSortBy("level")}>
              Level
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("courses")}>
              Courses Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("badges")}>
              Badges Earned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <TabsList className="glass border border-primary/10 mb-6">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLearners.map((learner) => (
              <Card
                key={learner.id}
                className="glass border-primary/10 overflow-hidden hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={learner.avatar || "/placeholder.svg"}
                        alt={learner.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                      />
                      {learner.isOnline && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{learner.name}</h3>
                        {learner.isVerified && (
                          <span className="text-primary" title="Verified">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53-1.471-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.146-.102l4-5.598z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {learner.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {learner.level}
                      </span>
                      <span className="text-muted-foreground">Level</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>{learner.badges}</span>
                      <span className="text-muted-foreground">Badges</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{learner.courses}</span>
                      <span className="text-muted-foreground">Courses</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-mono text-muted-foreground truncate w-32">
                      {learner.walletAddress.slice(0, 6)}...
                      {learner.walletAddress.slice(-4)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="space-y-4">
            {filteredLearners.map((learner) => (
              <Card
                key={learner.id}
                className="glass border-primary/10 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={learner.avatar || "/placeholder.svg"}
                          alt={learner.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                        />
                        {learner.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{learner.name}</h3>
                          {learner.isVerified && (
                            <span className="text-primary" title="Verified">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53-1.471-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.146-.102l4-5.598z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {learner.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {learner.level}
                        </span>
                        <span className="text-muted-foreground">Level</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{learner.badges}</span>
                        <span className="text-muted-foreground">Badges</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{learner.courses}</span>
                        <span className="text-muted-foreground">Courses</span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate w-32">
                        {learner.walletAddress.slice(0, 6)}...
                        {learner.walletAddress.slice(-4)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="messages">
          <div className="space-y-6">
            <Card className="glass border-primary/10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Compose a message</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Private</span>
                    <Switch
                      checked={msgPrivate}
                      onCheckedChange={setMsgPrivate}
                    />
                  </div>
                </div>
                {!isConnected ? (
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to post messages.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share something with the community..."
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={postMessage}
                        disabled={posting || !msgContent.trim()}
                      >
                        {posting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {messages.length === 0 && !loadingMsgs ? (
                <p className="text-sm text-muted-foreground">
                  No messages yet.
                </p>
              ) : null}

              {messages.map((m) => (
                <Card key={m.id} className="glass border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-muted-foreground">
                            {(m.authorAddress || "").slice(0, 6)}...
                            {(m.authorAddress || "").slice(-4)}
                          </p>
                          {m.isPrivate ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Private
                            </span>
                          ) : null}
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          !loadingMsgs && offset - limit >= 0
                            ? fetchMessages(offset - limit)
                            : undefined
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          !loadingMsgs && hasMore
                            ? fetchMessages(offset + limit)
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <Button
                  variant="outline"
                  onClick={() => fetchMessages(offset)}
                  disabled={loadingMsgs}
                >
                  {loadingMsgs ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button variant="outline" className="glass border-primary/20">
          Load More Learners
        </Button>
      </div>
    </div>
  );
}
