import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { DatabaseReader } from "./_generated/server";

/** A room counts as on-air until it goes this long without a heartbeat. */
const LIVE_WINDOW_MS = 60_000;

/** No I/O 0/O/1, so a read-out join code can never be mistyped. */
const SLUG_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSlug() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
  return out;
}

function cleanTitle(title: string) {
  const trimmed = title.replace(/\s+/g, " ").trim();
  if (!trimmed) return "Untitled stream";
  return trimmed.slice(0, 60);
}

async function findRoom(db: DatabaseReader, slug: string) {
  return await db
    .query("rooms")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

async function freshSlug(db: DatabaseReader) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = randomSlug();
    if ((await findRoom(db, slug)) === null) return slug;
  }
  return randomSlug();
}

/** Open a new room and return the join code to share. */
export const createRoom = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to start a room.");
    const user = await ctx.db.get(userId);
    const now = Date.now();
    const slug = await freshSlug(ctx.db);

    await ctx.db.insert("rooms", {
      slug,
      title: cleanTitle(title),
      hostId: userId,
      hostName: user?.name?.trim() || user?.email || "Host",
      createdAt: now,
      lastSeenAt: now,
    });

    return slug;
  },
});

/** Rooms that are currently beating, newest first. Powers the lobby. */
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const recent = await ctx.db
      .query("rooms")
      .withIndex("by_lastSeenAt")
      .order("desc")
      .take(50);
    return recent.filter((room) => now - room.lastSeenAt < LIVE_WINDOW_MS);
  },
});

/** One room by join code, or null. */
export const getRoom = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    if (!slug) return null;
    return await findRoom(ctx.db, slug);
  },
});

/**
 * Keeps a room on-air while someone is connected. Called on join and then on
 * an interval. It also back-fills a room row for anyone arriving through an
 * invite link whose row has already gone stale.
 */
export const heartbeat = mutation({
  args: {
    slug: v.string(),
    title: v.optional(v.string()),
    hostName: v.optional(v.string()),
  },
  handler: async (ctx, { slug, title, hostName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to join a room.");
    if (!slug) throw new Error("Missing room code.");
    const now = Date.now();

    const existing = await findRoom(ctx.db, slug);
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: now });
      return existing.slug;
    }

    const user = await ctx.db.get(userId);
    await ctx.db.insert("rooms", {
      slug,
      title: cleanTitle(title ?? "Live room"),
      hostId: userId,
      hostName: hostName?.trim() || user?.name?.trim() || user?.email || "Host",
      createdAt: now,
      lastSeenAt: now,
    });
    return slug;
  },
});
