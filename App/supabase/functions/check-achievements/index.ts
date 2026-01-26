import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface UserProgress {
  user_id: string;
  total_habits_completed: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
  current_level: number;
}

interface Achievement {
  id: string;
  condition_type: string;
  condition_value: number;
  gem_reward: number;
}

interface UnlockResult {
  userId: string;
  achievementId: string;
  gemsRewarded: number;
}

async function getActiveUsers(): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from("user_progress")
    .select(
      "user_id, total_habits_completed, current_streak, longest_streak, perfect_days, current_level"
    )
    .gte("last_activity_date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  if (error) throw error;
  return data || [];
}

async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("id, condition_type, condition_value, gem_reward");

  if (error) throw error;
  return data || [];
}

async function getUserAchievements(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data || []).map((ua) => ua.achievement_id));
}

function checkCondition(
  achievement: Achievement,
  user: UserProgress
): boolean {
  switch (achievement.condition_type) {
    case "habit_count":
      return user.total_habits_completed >= achievement.condition_value;
    case "streak_days":
      return user.current_streak >= achievement.condition_value;
    case "perfect_days":
      return user.perfect_days >= achievement.condition_value;
    case "level_reached":
      return user.current_level >= achievement.condition_value;
    default:
      return false;
  }
}

async function unlockAchievement(
  userId: string,
  achievement: Achievement,
  user: UserProgress
): Promise<number> {
  const { data, error } = await supabase.rpc("unlock_achievement", {
    p_user_id: userId,
    p_achievement_id: achievement.id,
    p_progress_snapshot: {
      habits_completed: user.total_habits_completed,
      current_streak: user.current_streak,
      longest_streak: user.longest_streak,
      perfect_days: user.perfect_days,
      level: user.current_level,
      auto_unlocked: true,
      unlocked_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error(`Error unlocking achievement ${achievement.id} for user ${userId}:`, error);
    throw error;
  }

  return data || achievement.gem_reward;
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Starting achievement detection...");

    // Get active users
    const activeUsers = await getActiveUsers();
    console.log(`Found ${activeUsers.length} active users`);

    // Get achievement catalog
    const achievements = await getAchievements();
    console.log(`Found ${achievements.length} achievements`);

    const unlockedList: UnlockResult[] = [];
    let errorCount = 0;

    // Check each user
    for (const user of activeUsers) {
      try {
        // Get user's already unlocked achievements
        const unlockedIds = await getUserAchievements(user.user_id);

        // Check each achievement
        for (const achievement of achievements) {
          // Skip if already unlocked
          if (unlockedIds.has(achievement.id)) {
            continue;
          }

          // Check if condition is met
          if (checkCondition(achievement, user)) {
            try {
              const gemsRewarded = await unlockAchievement(
                user.user_id,
                achievement,
                user
              );

              unlockedList.push({
                userId: user.user_id,
                achievementId: achievement.id,
                gemsRewarded,
              });

              console.log(
                `Unlocked ${achievement.id} for user ${user.user_id}, rewarded ${gemsRewarded} gems`
              );
            } catch (unlockError) {
              console.error(
                `Failed to unlock ${achievement.id} for user ${user.user_id}:`,
                unlockError
              );
              errorCount++;
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Achievement detection completed",
        stats: {
          activeUsers: activeUsers.length,
          achievements: achievements.length,
          unlockedCount: unlockedList.length,
          errorCount,
        },
        unlocked: unlockedList.slice(0, 10), // Return first 10 for logging
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Achievement detection error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
