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
  Users,
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
import useCeloreanContract from "@/hooks/useCeloreanContract";

interface Student {
  address: string;
  badges: number;
  courses: number;
  isOnline: boolean;
}

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("courses");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const { address, isConnected } = useAccount();
  const { getListOfStudents, fetchCoursesRegisteredByStudent } = useCeloreanContract();

  // Messages state
  const [msgContent, setMsgContent] = useState("");
  const [msgPrivate, setMsgPrivate] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [posting, setPosting] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  // Fetch admitted students from blockchain
  const { data: studentAddresses, isLoading: isLoadingAddresses } = getListOfStudents();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentAddresses || (studentAddresses as any[]).length === 0) {
        setStudents([]);
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true);
      try {
        const addresses = studentAddresses as string[];
        const studentData: Student[] = [];

        // Fetch sequentially with delays to avoid rate limits
        for (const addr of addresses) {
          try {
            // Fetch courses for each student using imperative function
            const coursesData = await fetchCoursesRegisteredByStudent(addr);
            const courseCount = coursesData ? (coursesData as any[]).length : 0;

            studentData.push({
              address: addr,
              badges: 0, // We don't have badge data from contract yet
              courses: courseCount,
              isOnline: false, // We don't track online status on-chain
            });

            // Add delay to avoid rate limiting (200ms between requests)
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`Failed to fetch data for ${addr}:`, error);
            studentData.push({
              address: addr,
              badges: 0,
              courses: 0,
              isOnline: false,
            });
            // Continue with next student even if one fails
          }
        }

        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    if (studentAddresses) {
      fetchStudentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentAddresses]);

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      if (filter === "online" && !student.isOnline) return false;
      return student.address.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
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
        <h1 className="text-3xl font-mono font-bold uppercase tracking-tight">COMMUNITY</h1>
        <p className="text-muted-foreground font-mono">
          Connect with other learners in the Celorean ecosystem
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="SEARCH BY WALLET ADDRESS..."
            className="pl-10 terminal-box font-mono uppercase placeholder:normal-case"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 font-mono uppercase">
              <Filter className="h-4 w-4" />
              FILTER
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="terminal-box font-mono">
            <DropdownMenuItem onClick={() => setFilter("all")} className="uppercase">
              ALL STUDENTS
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("online")} className="uppercase">
              ONLINE ONLY
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 font-mono uppercase">
              SORT BY
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="terminal-box font-mono">
            <DropdownMenuItem onClick={() => setSortBy("courses")} className="uppercase">
              COURSES COMPLETED
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("badges")} className="uppercase">
              BADGES EARNED
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <TabsList className="terminal-box border border-terminal-border mb-6">
          <TabsTrigger value="grid">GRID VIEW</TabsTrigger>
          <TabsTrigger value="list">LIST VIEW</TabsTrigger>
          <TabsTrigger
            value="messages"
            disabled
            className="opacity-60 cursor-not-allowed"
          >
            MESSAGES
            <span className="ml-2 text-[9px] px-1.5 py-0.5 border border-terminal-orange text-terminal-orange">SOON</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {loadingStudents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 terminal-box animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <Card className="terminal-box">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-mono font-bold uppercase mb-2">NO STUDENTS FOUND</h3>
                <p className="text-muted-foreground font-mono">
                  {students.length === 0
                    ? "No admitted students yet."
                    : "Try adjusting your search or filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <Card
                  key={student.address}
                  className="terminal-box overflow-hidden hover:border-terminal-green transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-2 border-terminal-green bg-terminal-green/10 flex items-center justify-center font-mono font-bold text-terminal-green">
                          {student.address.slice(2, 4).toUpperCase()}
                        </div>
                        {student.isOnline && (
                          <span className="absolute bottom-0 right-0 status-dot status-dot-active"></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold uppercase text-sm">STUDENT #{index + 1}</h3>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {student.address.slice(0, 8)}...{student.address.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4 py-3 border-y border-terminal-border">
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-4 w-4 text-terminal-green" />
                        <span className="font-mono font-bold">{student.badges}</span>
                        <span className="text-muted-foreground font-mono text-xs uppercase">BADGES</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <BookOpen className="h-4 w-4 text-terminal-green" />
                        <span className="font-mono font-bold">{student.courses}</span>
                        <span className="text-muted-foreground font-mono text-xs uppercase">COURSES</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-mono text-muted-foreground uppercase">
                        VERIFIED
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="flex items-center gap-1 font-mono uppercase text-xs opacity-60 cursor-not-allowed"
                      >
                        <MessageSquare className="h-3 w-3" />
                        CONNECT
                        <span className="ml-1 text-[10px] px-1 border border-terminal-orange text-terminal-orange">SOON</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          {loadingStudents ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 terminal-box animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <Card className="terminal-box">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-mono font-bold uppercase mb-2">NO STUDENTS FOUND</h3>
                <p className="text-muted-foreground font-mono">
                  {students.length === 0
                    ? "No admitted students yet."
                    : "Try adjusting your search or filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
                <Card
                  key={student.address}
                  className="terminal-box hover:border-terminal-green transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-2 border-terminal-green bg-terminal-green/10 flex items-center justify-center font-mono font-bold text-terminal-green text-sm">
                            {student.address.slice(2, 4).toUpperCase()}
                          </div>
                          {student.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-terminal-green rounded-full border-2 border-background"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono font-bold uppercase text-sm">STUDENT #{index + 1}</h3>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {student.address}
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-1 text-sm">
                          <Award className="h-4 w-4 text-terminal-green" />
                          <span className="font-mono font-bold">{student.badges}</span>
                          <span className="text-muted-foreground font-mono text-xs uppercase">BADGES</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <BookOpen className="h-4 w-4 text-terminal-green" />
                          <span className="font-mono font-bold">{student.courses}</span>
                          <span className="text-muted-foreground font-mono text-xs uppercase">COURSES</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center gap-1 font-mono uppercase text-xs opacity-60 cursor-not-allowed"
                        >
                          <MessageSquare className="h-3 w-3" />
                          CONNECT
                          <span className="ml-1 text-[10px] px-1 border border-terminal-orange text-terminal-orange">SOON</span>
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" disabled className="md:hidden font-mono uppercase opacity-60 cursor-not-allowed">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <div className="space-y-6">
            <Card className="terminal-box">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono font-bold uppercase">COMPOSE MESSAGE</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono uppercase text-xs">PRIVATE</span>
                    <Switch
                      checked={msgPrivate}
                      onCheckedChange={setMsgPrivate}
                    />
                  </div>
                </div>
                {!isConnected ? (
                  <p className="text-sm text-muted-foreground font-mono">
                    Connect your wallet to post messages.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share something with the community..."
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      className="min-h-[100px] terminal-box font-mono"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={postMessage}
                        disabled={posting || !msgContent.trim()}
                        className="font-mono uppercase"
                      >
                        {posting ? "POSTING..." : "POST"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {messages.length === 0 && !loadingMsgs ? (
                <p className="text-sm text-muted-foreground font-mono text-center py-8">
                  No messages yet.
                </p>
              ) : null}

              {messages.map((m) => (
                <Card key={m.id} className="terminal-box">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-muted-foreground">
                            {(m.authorAddress || "").slice(0, 6)}...
                            {(m.authorAddress || "").slice(-4)}
                          </p>
                          {m.isPrivate ? (
                            <span className="text-xs px-2 py-0.5 border border-terminal-orange bg-terminal-orange/10 text-terminal-orange font-mono uppercase tracking-wider">
                              PRIVATE
                            </span>
                          ) : null}
                        </div>
                        <p className="whitespace-pre-wrap font-mono text-sm">{m.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4 font-mono">
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
                  className="font-mono uppercase"
                >
                  {loadingMsgs ? "LOADING..." : "REFRESH"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
