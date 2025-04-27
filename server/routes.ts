import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertHabitSchema, insertHabitLogSchema, insertCommunityPostSchema, insertUserCheerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Habits API
  app.post("/api/habits", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/habits", requireAuth, async (req, res, next) => {
    try {
      const habits = await storage.getUserHabits(req.user!.id);
      res.status(200).json(habits);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/habits/:habitId/complete", requireAuth, async (req, res, next) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      if (habit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to complete this habit" });
      }
      
      const validatedData = insertHabitLogSchema.parse({
        habitId,
        userId: req.user!.id
      });
      
      const log = await storage.logHabitCompletion(validatedData);
      
      // Get updated habit with new streak
      const updatedHabit = await storage.getHabit(habitId);
      
      res.status(200).json({
        log,
        habit: updatedHabit
      });
    } catch (error) {
      next(error);
    }
  });

  // Achievements API
  app.get("/api/achievements", requireAuth, async (req, res, next) => {
    try {
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(req.user!.id);
      
      const unlockedIds = userAchievements.map(ua => ua.id);
      
      const result = achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id),
        unlockedAt: userAchievements.find(ua => ua.id === achievement.id)?.unlockedAt || null
      }));
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // Leaderboard API
  app.get("/api/leaderboard", requireAuth, async (req, res, next) => {
    try {
      const global = req.query.global === 'true';
      
      if (global) {
        const leaderboard = await storage.getLeaderboard();
        res.status(200).json(leaderboard);
      } else {
        const friends = await storage.getUserFriends(req.user!.id);
        res.status(200).json(friends);
      }
    } catch (error) {
      next(error);
    }
  });

  // Community API
  app.get("/api/community/activity", requireAuth, async (req, res, next) => {
    try {
      const activity = await storage.getCommunityActivity();
      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/community/posts", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const post = await storage.createCommunityPost(validatedData);
      
      // Get formatted post with user data
      const [formattedPost] = await storage.getCommunityActivity();
      
      res.status(201).json(formattedPost);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/community/posts/:postId/cheer", requireAuth, async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      
      const validatedData = insertUserCheerSchema.parse({
        postId,
        userId: req.user!.id
      });
      
      const cheer = await storage.cheerPost(validatedData);
      res.status(200).json(cheer);
    } catch (error) {
      next(error);
    }
  });

  // User stats API
  app.get("/api/user/stats", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const habits = await storage.getUserHabits(user.id);
      
      // Calculate completion percentage
      const totalHabits = habits.length;
      const completedToday = habits.filter(habit => habit.isCompletedToday).length;
      const completionPercentage = totalHabits > 0 
        ? Math.round((completedToday / totalHabits) * 100) 
        : 0;
      
      // Calculate longest streak
      const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
      
      // Calculate XP to next level
      const xpForNextLevel = user.level * 1000;
      const xpProgress = user.xp;
      const xpRemaining = xpForNextLevel - xpProgress;
      
      res.status(200).json({
        completionPercentage,
        longestStreak,
        level: user.level,
        division: user.division,
        xp: {
          current: xpProgress,
          total: xpForNextLevel,
          remaining: xpRemaining,
          percentage: Math.round((xpProgress / xpForNextLevel) * 100)
        },
        habitsCount: {
          total: totalHabits,
          completed: completedToday
        }
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
