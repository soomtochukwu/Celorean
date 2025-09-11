import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Simple file-backed storage for community messages (dev/demo purposes)
// Data shape
// type Message = {
//   id: string
//   authorAddress: string
//   content: string
//   isPrivate: boolean
//   status: "approved" | "pending" | "rejected"
//   flagged: boolean
//   createdAt: string
// }

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "community-messages.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readMessages(): Promise<any[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeMessages(messages: any[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit") || 20))
    );
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));
    const author = (searchParams.get("author") || "").toLowerCase();
    const viewer = (searchParams.get("viewer") || "").toLowerCase();
    const statusFilter = (searchParams.get("status") || "").toLowerCase();

    const all = await readMessages();

    const filtered = all.filter((m) => {
      // author filter
      if (author && (m.authorAddress || "").toLowerCase() !== author)
        return false;
      // status filter
      if (statusFilter && (m.status || "").toLowerCase() !== statusFilter)
        return false;
      // privacy filter: only show private messages to their author (matching viewer)
      if (m.isPrivate) {
        if (!viewer) return false;
        return (m.authorAddress || "").toLowerCase() === viewer;
      }
      return true;
    });

    // newest first
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = String(body?.content || "").trim();
    const authorAddress = String(body?.authorAddress || "").trim();
    const isPrivate = Boolean(body?.isPrivate) || false;

    if (
      !authorAddress ||
      !authorAddress.startsWith("0x") ||
      authorAddress.length < 10
    ) {
      return NextResponse.json(
        { error: "Invalid or missing authorAddress" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Content exceeds 1000 characters" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    // node:18+ has crypto.randomUUID
    const id =
      (globalThis as any).crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const message = {
      id,
      authorAddress,
      content,
      isPrivate,
      status: "approved" as const, // basic moderation field; future: set to "pending" and add review flow
      flagged: false,
      createdAt: now,
    };

    const all = await readMessages();
    all.push(message);
    await writeMessages(all);

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create message" },
      { status: 500 }
    );
  }
}
