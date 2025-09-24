import { useState } from "react";
import { Calendar as CalendarIcon, TrendingUp, Target, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationBar from "@/components/NavigationBar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for habit completion
const mockCompletionData = {
  "2024-01-15": { completed: 3, total: 4, habits: ["Meditação", "Exercícios", "Leitura"] },
  "2024-01-16": { completed: 4, total: 4, habits: ["Meditação", "Exercícios", "Leitura", "Gratidão"] },
  "2024-01-17": { completed: 2, total: 4, habits: ["Exercícios", "Leitura"] },
  "2024-01-18": { completed: 4, total: 4, habits: ["Meditação", "Exercícios", "Leitura", "Gratidão"] },
  "2024-01-19": { completed: 1, total: 4, habits: ["Exercícios"] },
  "2024-01-20": { completed: 3, total: 4, habits: ["Meditação", "Leitura", "Gratidão"] },
  "2024-01-21": { completed: 4, total: 4, habits: ["Meditação", "Exercícios", "Leitura", "Gratidão"] },
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getCompletionRate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const data = mockCompletionData[dateKey as keyof typeof mockCompletionData];
    if (!data) return 0;
    return Math.round((data.completed / data.total) * 100);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return "bg-success";
    if (rate >= 75) return "bg-primary";
    if (rate >= 50) return "bg-accent";
    if (rate > 0) return "bg-muted";
    return "bg-background";
  };

  const getSelectedDateData = () => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return mockCompletionData[dateKey as keyof typeof mockCompletionData] || null;
  };

  const selectedData = getSelectedDateData();

  // Calculate monthly stats
  const monthlyStats = Object.entries(mockCompletionData)
    .filter(([dateKey]) => {
      const date = new Date(dateKey);
      return isSameMonth(date, currentDate);
    })
    .reduce(
      (acc, [_, data]) => {
        acc.totalDays++;
        acc.totalCompleted += data.completed;
        acc.totalPossible += data.total;
        if (data.completed === data.total) acc.perfectDays++;
        return acc;
      },
      { totalDays: 0, totalCompleted: 0, totalPossible: 0, perfectDays: 0 }
    );

  const monthlyRate = monthlyStats.totalPossible > 0 
    ? Math.round((monthlyStats.totalCompleted / monthlyStats.totalPossible) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <span className="gradient-text">Calendário</span>
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso ao longo do tempo
            </p>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-light text-muted-foreground">Taxa mensal</p>
                  <p className="text-2xl font-medium">{monthlyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-xl">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-light text-muted-foreground">Dias perfeitos</p>
                  <p className="text-2xl font-medium">{monthlyStats.perfectDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-light text-muted-foreground">Hábitos completos</p>
                  <p className="text-2xl font-medium">{monthlyStats.totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="glass-card mb-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const completionRate = getCompletionRate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium relative
                      transition-all duration-200 hover:scale-105
                      ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                      ${isSelected ? "ring-2 ring-primary" : ""}
                      ${isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}
                    `}
                  >
                    <span className="relative z-10">{format(day, "d")}</span>
                    
                    {/* Completion indicator */}
                    {isCurrentMonth && completionRate > 0 && !isToday && (
                      <div 
                        className={`
                          absolute inset-1 rounded-md opacity-30
                          ${getCompletionColor(completionRate)}
                        `}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && selectedData && (
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="font-medium">Progresso do dia</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">
                      {selectedData.completed}/{selectedData.total}
                    </span>
                    <span className="text-muted-foreground">
                      ({Math.round((selectedData.completed / selectedData.total) * 100)}%)
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Hábitos completados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedData.habits.map((habit, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium"
                      >
                        ✓ {habit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Calendar;