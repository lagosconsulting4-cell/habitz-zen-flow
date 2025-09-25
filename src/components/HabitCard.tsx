import { Check, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  period: "morning" | "afternoon" | "evening";
  streak: number;
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  isCompleted?: boolean;
}

const HabitCard = ({ habit, onToggle, isCompleted = false }: HabitCardProps) => {
  const getPeriodClass = () => {
    switch (habit.period) {
      case "morning": return "habit-card-morning";
      case "afternoon": return "habit-card-afternoon";
      case "evening": return "habit-card-evening";
      default: return "";
    }
  };

  const getCategoryColor = () => {
    switch (habit.category) {
      case "mente": return "text-purple-600";
      case "corpo": return "text-green-600";
      case "estudo": return "text-blue-600";
      case "saúde": return "text-pink-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Card 
      className={`habit-card ${getPeriodClass()} ${isCompleted ? "opacity-75" : ""}`}
      onClick={() => onToggle(habit.id)}
    >
      <div className="flex items-center gap-4">
        {/* Emoji */}
        <div className="text-3xl animate-float">{habit.emoji}</div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium text-lg ${isCompleted ? "line-through" : ""}`}>
              {habit.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full bg-white/20 ${getCategoryColor()}`}>
              {habit.category}
            </span>
          </div>
          
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                {habit.streak} dias seguidos
              </span>
            </div>
          )}
        </div>

        {/* Check Button */}
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-white/20 hover:bg-white/30 border-2 border-white/30"
          }`}
        >
          {isCompleted ? (
            <Check className="w-6 h-6 animate-scale-in" />
          ) : (
            <div className="w-2 h-2 bg-white/50 rounded-full" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default HabitCard;