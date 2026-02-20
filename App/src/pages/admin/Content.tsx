import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { FileText, BookOpen, Lightbulb, MessageSquare, Calendar, Compass, Plus, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface ContentStats {
  total_meditations: number;
  total_quotes: number;
  total_tips: number;
  total_books: number;
  total_guided_days: number;
  total_journeys: number;
  total_journey_days: number;
  total_journey_habits: number;
}

interface JourneyRow {
  id: string;
  slug: string;
  title: string;
  level: number;
  is_active: boolean;
  duration_days: number;
  theme_slug: string;
}

interface JourneyDayRow {
  id: string;
  day_number: number;
  title: string;
  card_content: string;
}

const AdminContent = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState<JourneyRow[]>([]);
  const [expandedJourney, setExpandedJourney] = useState<string | null>(null);
  const [journeyDays, setJourneyDays] = useState<JourneyDayRow[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingDay, setSavingDay] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsRes, journeysRes] = await Promise.all([
          supabase.from("admin_content_stats").select("*").single(),
          supabase.from("journeys").select("id, slug, title, level, is_active, duration_days, theme_slug").order("sort_order"),
        ]);

        if (statsRes.error) throw statsRes.error;
        setStats(statsRes.data);
        setJourneys((journeysRes.data || []) as JourneyRow[]);
      } catch (error) {
        console.error("Error loading content stats:", error);
        toast.error("Failed to load content statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const toggleJourneyActive = async (journeyId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("journeys")
      .update({ is_active: !currentActive })
      .eq("id", journeyId);
    if (error) {
      toast.error("Failed to update journey");
      return;
    }
    setJourneys((prev) => prev.map((j) => (j.id === journeyId ? { ...j, is_active: !currentActive } : j)));
    toast.success(`Journey ${!currentActive ? "activated" : "deactivated"}`);
  };

  const loadJourneyDays = async (journeyId: string) => {
    if (expandedJourney === journeyId) {
      setExpandedJourney(null);
      return;
    }
    const { data, error } = await supabase
      .from("journey_days")
      .select("id, day_number, title, card_content")
      .eq("journey_id", journeyId)
      .order("day_number");
    if (error) {
      toast.error("Failed to load journey days");
      return;
    }
    setJourneyDays((data || []) as JourneyDayRow[]);
    setExpandedJourney(journeyId);
    setEditingDay(null);
  };

  const startEditDay = (day: JourneyDayRow) => {
    setEditingDay(day.id);
    setEditContent(day.card_content);
  };

  const saveDay = async (dayId: string) => {
    setSavingDay(true);
    const { error } = await supabase
      .from("journey_days")
      .update({ card_content: editContent })
      .eq("id", dayId);
    setSavingDay(false);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    setJourneyDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, card_content: editContent } : d)));
    setEditingDay(null);
    toast.success("Day content saved");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage meditations, tips, books, quotes, and guided days</p>
      </div>

      {/* Content Stats Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Meditations</p>
              <p className="text-2xl font-bold">{stats?.total_meditations || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Quotes</p>
              <p className="text-2xl font-bold">{stats?.total_quotes || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Tips</p>
              <p className="text-2xl font-bold">{stats?.total_tips || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Books</p>
              <p className="text-2xl font-bold">{stats?.total_books || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Guided Days</p>
              <p className="text-2xl font-bold">{stats?.total_guided_days || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-teal-500" />
            <div>
              <p className="text-xs text-muted-foreground">Journeys</p>
              <p className="text-2xl font-bold">{stats?.total_journeys || 0}</p>
              <p className="text-[10px] text-muted-foreground">{stats?.total_journey_days || 0} days · {stats?.total_journey_habits || 0} habits</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="meditations" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="meditations">Meditations</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="guided">Guided Days</TabsTrigger>
          <TabsTrigger value="journeys">Journeys</TabsTrigger>
        </TabsList>

        <TabsContent value="meditations" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Meditation Library</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Meditation
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Content management interface coming soon. For now, manage meditations directly in the Supabase Dashboard.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quotes Collection</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Quote
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Content management interface coming soon. For now, manage quotes directly in the Supabase Dashboard.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tips Library</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Tip
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Content management interface coming soon. For now, manage tips directly in the Supabase Dashboard.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Books Collection</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Content management interface coming soon. For now, manage books directly in the Supabase Dashboard.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="guided" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Guided Days</h3>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Guided Day
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Content management interface coming soon. For now, manage guided days directly in the Supabase Dashboard.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Journey Catalog</h3>
              <Badge variant="secondary">{journeys.length} journeys</Badge>
            </div>

            <div className="space-y-2">
              {journeys.map((j) => (
                <div key={j.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => loadJourneyDays(j.id)} className="text-muted-foreground hover:text-foreground">
                        {expandedJourney === j.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <div>
                        <span className="font-medium text-sm">{j.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">L{j.level} · {j.duration_days}d · {j.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={j.is_active ? "default" : "secondary"}>
                        {j.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleJourneyActive(j.id, j.is_active)}
                      >
                        {j.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>

                  {expandedJourney === j.id && (
                    <div className="border-t px-3 py-2 bg-muted/30 space-y-2 max-h-[400px] overflow-y-auto">
                      {journeyDays.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No days found for this journey.</p>
                      ) : (
                        journeyDays.map((day) => (
                          <div key={day.id} className="border rounded p-2 bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">Day {day.day_number}: {day.title}</span>
                              {editingDay === day.id ? (
                                <Button size="sm" variant="default" onClick={() => saveDay(day.id)} disabled={savingDay}>
                                  <Save className="h-3 w-3 mr-1" />
                                  {savingDay ? "Saving..." : "Save"}
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => startEditDay(day)}>
                                  Edit
                                </Button>
                              )}
                            </div>
                            {editingDay === day.id ? (
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="text-xs min-h-[120px] font-mono"
                              />
                            ) : (
                              <p className="text-xs text-muted-foreground line-clamp-2">{day.card_content.slice(0, 150)}...</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
