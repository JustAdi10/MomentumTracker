import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  division: text("division").default("Bronze"),
});

// Habit schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  icon: text("icon"),
  color: text("color"),
  targetDays: integer("target_days"), // e.g., which days of week for weekly habits
  reminderTime: text("reminder_time"), // time of day for reminder
  streak: integer("streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Habit Logs schema
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  userId: integer("user_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  streak: integer("streak"),
});

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").default(0),
  unlockCondition: text("unlock_condition").notNull(),
  unlockValue: integer("unlock_value").notNull(),
});

// User Achievements schema (junction)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Community Posts schema
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // achievement, streak, milestone
  relatedId: integer("related_id"), // Achievement ID, etc.
  createdAt: timestamp("created_at").defaultNow(),
  cheers: integer("cheers").default(0),
});

// User Cheers schema (who cheered which posts)
export const userCheers = pgTable("user_cheers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  profileImage: true,
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  userId: true,
  name: true,
  description: true,
  frequency: true,
  icon: true,
  color: true,
  targetDays: true,
  reminderTime: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).pick({
  habitId: true,
  userId: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  userId: true,
  content: true,
  type: true,
  relatedId: true,
});

export const insertUserCheerSchema = createInsertSchema(userCheers).pick({
  userId: true,
  postId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertUserCheer = z.infer<typeof insertUserCheerSchema>;
export type UserCheer = typeof userCheers.$inferSelect;

// Special types for responses
export type HabitWithLogs = Habit & {
  logs: HabitLog[];
  isCompletedToday: boolean;
};

export type LeaderboardEntry = {
  userId: number;
  username: string;
  displayName: string;
  profileImage: string | null;
  level: number;
  division: string;
  streak: number;
  weeklyXP: number;
  rank: number;
};

export type CommunityActivity = CommunityPost & {
  user: {
    id: number;
    username: string;
    displayName: string;
    profileImage: string | null;
  };
  timestamp: string;
};
