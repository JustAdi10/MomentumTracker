import { 
  users, habits, habitLogs, achievements, userAchievements, 
  communityPosts, userCheers, 
  type User, type InsertUser, type Habit, type InsertHabit,
  type HabitLog, type InsertHabitLog, type Achievement,
  type UserAchievement, type CommunityPost, type InsertCommunityPost,
  type UserCheer, type InsertUserCheer, type HabitWithLogs,
  type LeaderboardEntry, type CommunityActivity
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: number, xpAmount: number): Promise<User>;
  levelUpUser(userId: number): Promise<User>;

  // Habit methods
  createHabit(habit: InsertHabit): Promise<Habit>;
  getUserHabits(userId: number): Promise<HabitWithLogs[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  updateHabitStreak(habitId: number, streak: number): Promise<Habit>;
  
  // Habit Log methods
  logHabitCompletion(log: InsertHabitLog): Promise<HabitLog>;
  getHabitLogs(habitId: number): Promise<HabitLog[]>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<(Achievement & { unlockedAt: Date })[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // Community methods
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityActivity(): Promise<CommunityActivity[]>;
  cheerPost(cheer: InsertUserCheer): Promise<UserCheer>;
  
  // Leaderboard methods
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getUserFriends(userId: number): Promise<LeaderboardEntry[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitLogs: Map<number, HabitLog>;
  private achievementsList: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private communityPosts: Map<number, CommunityPost>;
  private userCheers: Map<number, UserCheer>;
  
  private userIdCounter: number;
  private habitIdCounter: number;
  private habitLogIdCounter: number;
  private achievementIdCounter: number;
  private userAchievementIdCounter: number;
  private communityPostIdCounter: number;
  private userCheerIdCounter: number;

  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitLogs = new Map();
    this.achievementsList = new Map();
    this.userAchievements = new Map();
    this.communityPosts = new Map();
    this.userCheers = new Map();
    
    this.userIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitLogIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.communityPostIdCounter = 1;
    this.userCheerIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize default achievements
    this.initializeAchievements();
  }

  private initializeAchievements() {
    const defaultAchievements = [
      {
        id: this.achievementIdCounter++,
        name: "Consistency Pro",
        description: "Completed 3 habits for 7 days in a row",
        icon: "lock",
        xpReward: 100,
        unlockCondition: "streak",
        unlockValue: 7
      },
      {
        id: this.achievementIdCounter++,
        name: "Rising Star",
        description: "Reached Level 5 in Momentum",
        icon: "chart",
        xpReward: 75,
        unlockCondition: "level",
        unlockValue: 5
      },
      {
        id: this.achievementIdCounter++,
        name: "10-Day Streak",
        description: "Maintained any habit for 10 days",
        icon: "flame",
        xpReward: 50,
        unlockCondition: "habit_streak",
        unlockValue: 10
      },
      {
        id: this.achievementIdCounter++,
        name: "Silver Division",
        description: "Reach Level 10 to unlock",
        icon: "lock",
        xpReward: 200,
        unlockCondition: "level",
        unlockValue: 10
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievementsList.set(achievement.id, achievement);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date();
    const id = this.userIdCounter++;
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      email: userData.email || null,
      displayName: userData.displayName || userData.username,
      profileImage: userData.profileImage || null,
      createdAt: now,
      level: 1,
      xp: 0,
      division: "Bronze"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(userId: number, xpAmount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    user.xp += xpAmount;
    
    // Check for level up
    const xpForNextLevel = user.level * 1000;
    if (user.xp >= xpForNextLevel) {
      return this.levelUpUser(userId);
    }
    
    this.users.set(userId, user);
    return user;
  }

  async levelUpUser(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    user.level += 1;
    user.xp = user.xp - (user.level - 1) * 1000; // Reset XP for next level
    
    // Update division if needed
    if (user.level >= 15) {
      user.division = "Gold";
    } else if (user.level >= 7) {
      user.division = "Silver";
    }
    
    this.users.set(userId, user);
    
    // Check for level-based achievements
    const levelAchievements = Array.from(this.achievementsList.values())
      .filter(achievement => achievement.unlockCondition === "level" && achievement.unlockValue <= user.level);
    
    for (const achievement of levelAchievements) {
      // Check if user already has this achievement
      const hasAchievement = Array.from(this.userAchievements.values())
        .some(ua => ua.userId === userId && ua.achievementId === achievement.id);
      
      if (!hasAchievement) {
        await this.unlockAchievement(userId, achievement.id);
        
        // Create post for achievement
        await this.createCommunityPost({
          userId,
          content: `reached Level ${user.level} and unlocked the "${achievement.name}" achievement!`,
          type: "achievement",
          relatedId: achievement.id
        });
      }
    }
    
    return user;
  }

  // Habit methods
  async createHabit(habitData: InsertHabit): Promise<Habit> {
    const now = new Date();
    const id = this.habitIdCounter++;
    const habit: Habit = {
      id,
      userId: habitData.userId,
      name: habitData.name,
      description: habitData.description || null,
      frequency: habitData.frequency,
      icon: habitData.icon || null,
      color: habitData.color || null,
      targetDays: habitData.targetDays || null,
      reminderTime: habitData.reminderTime || null,
      streak: 0,
      createdAt: now,
      updatedAt: now
    };
    this.habits.set(id, habit);
    return habit;
  }

  async getUserHabits(userId: number): Promise<HabitWithLogs[]> {
    const userHabits = Array.from(this.habits.values())
      .filter(habit => habit.userId === userId);
    
    return Promise.all(userHabits.map(async habit => {
      const logs = await this.getHabitLogs(habit.id);
      
      // Check if habit was completed today
      const today = new Date().toISOString().split('T')[0];
      const isCompletedToday = logs.some(log => 
        log.completedAt.toISOString().split('T')[0] === today
      );
      
      return {
        ...habit,
        logs,
        isCompletedToday
      };
    }));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async updateHabitStreak(habitId: number, streak: number): Promise<Habit> {
    const habit = await this.getHabit(habitId);
    if (!habit) throw new Error(`Habit with ID ${habitId} not found`);
    
    habit.streak = streak;
    habit.updatedAt = new Date();
    this.habits.set(habitId, habit);
    
    // Check for streak-based achievements
    if (streak >= 10) {
      const user = await this.getUser(habit.userId);
      if (!user) throw new Error(`User with ID ${habit.userId} not found`);
      
      const streakAchievements = Array.from(this.achievementsList.values())
        .filter(achievement => achievement.unlockCondition === "habit_streak" && achievement.unlockValue <= streak);
      
      for (const achievement of streakAchievements) {
        // Check if user already has this achievement
        const hasAchievement = Array.from(this.userAchievements.values())
          .some(ua => ua.userId === habit.userId && ua.achievementId === achievement.id);
        
        if (!hasAchievement) {
          await this.unlockAchievement(habit.userId, achievement.id);
          
          // Create post for streak achievement
          await this.createCommunityPost({
            userId: habit.userId,
            content: `maintained the "${habit.name}" habit for ${streak} days in a row!`,
            type: "streak",
            relatedId: habit.id
          });
        }
      }
    }
    
    return habit;
  }

  // Habit Log methods
  async logHabitCompletion(logData: InsertHabitLog): Promise<HabitLog> {
    const habit = await this.getHabit(logData.habitId);
    if (!habit) throw new Error(`Habit with ID ${logData.habitId} not found`);
    
    const now = new Date();
    const id = this.habitLogIdCounter++;
    
    // Update streak
    const lastLog = Array.from(this.habitLogs.values())
      .filter(log => log.habitId === logData.habitId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
    
    let newStreak = habit.streak;
    
    if (lastLog) {
      const lastLogDate = new Date(lastLog.completedAt);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If the last log was yesterday, increase streak
      if (lastLogDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        newStreak += 1;
      } 
      // If the last log was today, don't change streak
      else if (lastLogDate.toISOString().split('T')[0] === now.toISOString().split('T')[0]) {
        // Do nothing, keep current streak
      } 
      // Otherwise, reset streak to 1
      else {
        newStreak = 1;
      }
    } else {
      // First completion
      newStreak = 1;
    }
    
    // Update habit streak
    await this.updateHabitStreak(logData.habitId, newStreak);
    
    // Create log entry
    const log: HabitLog = {
      id,
      habitId: logData.habitId,
      userId: logData.userId,
      completedAt: now,
      streak: newStreak
    };
    
    this.habitLogs.set(id, log);
    
    // Award XP for completion (10 XP per completion)
    await this.updateUserXP(logData.userId, 10);
    
    return log;
  }

  async getHabitLogs(habitId: number): Promise<HabitLog[]> {
    return Array.from(this.habitLogs.values())
      .filter(log => log.habitId === habitId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievementsList.values());
  }

  async getUserAchievements(userId: number): Promise<(Achievement & { unlockedAt: Date })[]> {
    const userAchievementEntries = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievementEntries.map(entry => {
      const achievement = this.achievementsList.get(entry.achievementId);
      if (!achievement) throw new Error(`Achievement with ID ${entry.achievementId} not found`);
      
      return {
        ...achievement,
        unlockedAt: entry.unlockedAt
      };
    });
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const achievement = this.achievementsList.get(achievementId);
    if (!achievement) throw new Error(`Achievement with ID ${achievementId} not found`);
    
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const now = new Date();
    const id = this.userAchievementIdCounter++;
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: now
    };
    
    this.userAchievements.set(id, userAchievement);
    
    // Award XP for achievement
    await this.updateUserXP(userId, achievement.xpReward);
    
    return userAchievement;
  }

  // Community methods
  async createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost> {
    const now = new Date();
    const id = this.communityPostIdCounter++;
    const post: CommunityPost = {
      id,
      userId: postData.userId,
      content: postData.content,
      type: postData.type,
      relatedId: postData.relatedId || null,
      createdAt: now,
      cheers: 0
    };
    
    this.communityPosts.set(id, post);
    return post;
  }

  async getCommunityActivity(): Promise<CommunityActivity[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(posts.map(async post => {
      const user = await this.getUser(post.userId);
      if (!user) throw new Error(`User with ID ${post.userId} not found`);
      
      return {
        ...post,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          profileImage: user.profileImage
        },
        timestamp: this.formatTimestamp(post.createdAt)
      };
    }));
  }

  async cheerPost(cheerData: InsertUserCheer): Promise<UserCheer> {
    const post = this.communityPosts.get(cheerData.postId);
    if (!post) throw new Error(`Post with ID ${cheerData.postId} not found`);
    
    // Check if user already cheered this post
    const alreadyCheered = Array.from(this.userCheers.values())
      .some(cheer => cheer.userId === cheerData.userId && cheer.postId === cheerData.postId);
    
    if (alreadyCheered) {
      throw new Error("You've already cheered this post");
    }
    
    const now = new Date();
    const id = this.userCheerIdCounter++;
    const cheer: UserCheer = {
      id,
      userId: cheerData.userId,
      postId: cheerData.postId,
      createdAt: now
    };
    
    this.userCheers.set(id, cheer);
    
    // Increment post cheers
    post.cheers += 1;
    this.communityPosts.set(post.id, post);
    
    return cheer;
  }

  // Leaderboard methods
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Create a map to track each user's weekly XP
    const weeklyXP = new Map<number, number>();
    
    // Calculate beginning of the week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as the first day
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate weekly XP from habit logs
    Array.from(this.habitLogs.values())
      .filter(log => log.completedAt >= startOfWeek)
      .forEach(log => {
        const currentXP = weeklyXP.get(log.userId) || 0;
        weeklyXP.set(log.userId, currentXP + 10); // 10 XP per completion
      });
    
    // Sort users by streak and weekly XP
    const users = Array.from(this.users.values());
    
    // Calculate longest streak for each user
    const longestStreaks = new Map<number, number>();
    users.forEach(user => {
      const userHabits = Array.from(this.habits.values())
        .filter(habit => habit.userId === user.id);
      
      const maxStreak = userHabits.reduce((max, habit) => 
        Math.max(max, habit.streak), 0);
      
      longestStreaks.set(user.id, maxStreak);
    });
    
    // Sort and build leaderboard
    const leaderboard = users
      .map(user => ({
        userId: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        profileImage: user.profileImage,
        level: user.level,
        division: user.division,
        streak: longestStreaks.get(user.id) || 0,
        weeklyXP: weeklyXP.get(user.id) || 0,
        rank: 0 // Will be filled in after sorting
      }))
      .sort((a, b) => {
        // Sort by streak first, then by weekly XP, then by level
        if (b.streak !== a.streak) return b.streak - a.streak;
        if (b.weeklyXP !== a.weeklyXP) return b.weeklyXP - a.weeklyXP;
        return b.level - a.level;
      })
      .slice(0, limit);
    
    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return leaderboard;
  }

  async getUserFriends(userId: number): Promise<LeaderboardEntry[]> {
    // For this MVP, simply return other users as "friends"
    const leaderboard = await this.getLeaderboard(10);
    
    // Include the user if not already in leaderboard
    const userInLeaderboard = leaderboard.some(entry => entry.userId === userId);
    
    if (!userInLeaderboard) {
      const user = await this.getUser(userId);
      if (user) {
        // Calculate user's weekly XP
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const weeklyXP = Array.from(this.habitLogs.values())
          .filter(log => log.userId === userId && log.completedAt >= startOfWeek)
          .length * 10;
        
        // Calculate longest streak
        const userHabits = Array.from(this.habits.values())
          .filter(habit => habit.userId === userId);
        
        const maxStreak = userHabits.reduce((max, habit) => 
          Math.max(max, habit.streak), 0);
        
        // Add user to leaderboard
        leaderboard.push({
          userId: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          profileImage: user.profileImage,
          level: user.level,
          division: user.division,
          streak: maxStreak,
          weeklyXP: weeklyXP,
          rank: leaderboard.length + 1
        });
        
        // Re-sort leaderboard
        leaderboard.sort((a, b) => {
          if (b.streak !== a.streak) return b.streak - a.streak;
          if (b.weeklyXP !== a.weeklyXP) return b.weeklyXP - a.weeklyXP;
          return b.level - a.level;
        });
        
        // Re-assign ranks
        leaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });
      }
    }
    
    return leaderboard;
  }

  // Helper function to format timestamps for activity feed
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
  }
}

export const storage = new MemStorage();
