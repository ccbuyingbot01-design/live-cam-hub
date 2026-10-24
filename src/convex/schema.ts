import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Live cam rooms. `lastSeenAt` is refreshed by a heartbeat while at least
    // one participant is connected; a room that stops beating is considered
    // closed, which keeps the lobby list honest without webhooks.
    rooms: defineTable({
      slug: v.string(), // short human-shareable join code, e.g. "K7XQ2M"
      title: v.string(), // display name of the stream
      hostId: v.id("users"), // user who opened the room
      hostName: v.string(), // display name shown in the lobby
      createdAt: v.number(),
      lastSeenAt: v.number(), // heartbeat timestamp
    })
      .index("by_slug", ["slug"])
      .index("by_lastSeenAt", ["lastSeenAt"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
