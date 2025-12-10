import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, BookOpen, Lightbulb, MessageSquare, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

interface ContentStats {
  total_meditations: number;
  total_quotes: number;
  total_tips: number;
  total_books: number;
  total_guided_days: number;
}

const AdminContent = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_content_stats")
          .select("*")
          .single();

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error("Error loading content stats:", error);
        toast.error("Failed to load content statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
      <div className="grid gap-4 md:grid-cols-5">
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
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="meditations" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="meditations">Meditations</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="guided">Guided Days</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default AdminContent;
