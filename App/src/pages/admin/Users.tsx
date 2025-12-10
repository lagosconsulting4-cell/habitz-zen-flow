import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreVertical, ShieldCheck, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  display_name: string;
  is_premium: boolean;
  is_admin: boolean;
  premium_since: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<{
    type: "suspend" | "restore" | "premium" | null;
    user: UserProfile | null;
  }>({ type: null, user: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Admin can query all profiles due to RLS policy
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, is_premium, is_admin, premium_since, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load users");
        console.error(error);
      } else {
        setUsers(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) =>
      term ? user.display_name?.toLowerCase().includes(term) || user.user_id.toLowerCase().includes(term) : true
    );
  }, [users, searchTerm]);

  const handleGrantPremium = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("admin_grant_premium", {
        p_admin_id: user.id,
        p_target_user_id: userId,
        p_reason: "Granted via admin dashboard",
      });

      if (error) {
        toast.error("Failed to grant premium");
        console.error(error);
      } else {
        toast.success("Premium granted successfully");
        loadUsers();
      }
    } catch (err) {
      toast.error("Error granting premium");
      console.error(err);
    }

    setSelectedAction({ type: null, user: null });
  };

  const handleSuspendUser = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("admin_suspend_user", {
        p_admin_id: user.id,
        p_target_user_id: userId,
        p_reason: "Suspended via admin dashboard",
      });

      if (error) {
        toast.error("Failed to suspend user");
        console.error(error);
      } else {
        toast.success("User suspended successfully");
        loadUsers();
      }
    } catch (err) {
      toast.error("Error suspending user");
      console.error(err);
    }

    setSelectedAction({ type: null, user: null });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">{users.length} total users</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium">User</th>
                <th className="p-4 text-left text-sm font-medium">Status</th>
                <th className="p-4 text-left text-sm font-medium">Joined</th>
                <th className="p-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <div className="font-medium">{user.display_name || "No name"}</div>
                    <div className="text-sm text-muted-foreground">{user.user_id.slice(0, 8)}...</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {user.is_admin && (
                        <Badge variant="default">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {user.is_premium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!user.is_premium && (
                          <DropdownMenuItem
                            onClick={() => setSelectedAction({ type: "premium", user })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Grant Premium
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setSelectedAction({ type: "suspend", user })}
                          className="text-destructive"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation dialogs */}
      <AlertDialog open={selectedAction.type !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction.type === "premium" && "Grant Premium Access"}
              {selectedAction.type === "suspend" && "Suspend User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction.type === "premium" &&
                `Grant premium access to ${selectedAction.user?.display_name}?`}
              {selectedAction.type === "suspend" &&
                `Suspend ${selectedAction.user?.display_name}? This will deactivate their habits.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAction({ type: null, user: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAction.type === "premium" && selectedAction.user) {
                  handleGrantPremium(selectedAction.user.user_id);
                } else if (selectedAction.type === "suspend" && selectedAction.user) {
                  handleSuspendUser(selectedAction.user.user_id);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
