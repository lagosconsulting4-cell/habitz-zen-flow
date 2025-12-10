import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Eye, Edit, Ban, CheckCircle, Trash } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  old_data: any;
  new_data: any;
  metadata: any;
  created_at: string;
}

const AdminAudit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error("Error loading audit logs:", error);
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "user_view":
      case "audit_view":
        return <Eye className="h-4 w-4" />;
      case "user_edit":
        return <Edit className="h-4 w-4" />;
      case "user_suspend":
        return <Ban className="h-4 w-4 text-destructive" />;
      case "user_restore":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "grant_premium":
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case "user_delete":
      case "content_delete":
        return <Trash className="h-4 w-4 text-destructive" />;
      default:
        return <ShieldCheck className="h-4 w-4" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes("suspend") || actionType.includes("delete")) {
      return "destructive";
    }
    if (actionType.includes("grant") || actionType.includes("restore")) {
      return "default";
    }
    return "secondary";
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
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Track all admin actions and system changes</p>
      </div>

      {logs.length === 0 ? (
        <Card className="p-12 text-center">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Audit Logs Yet</h3>
          <p className="text-sm text-muted-foreground">
            Admin actions will appear here once they are performed.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium">Timestamp</th>
                  <th className="p-4 text-left text-sm font-medium">Admin</th>
                  <th className="p-4 text-left text-sm font-medium">Action</th>
                  <th className="p-4 text-left text-sm font-medium">Target</th>
                  <th className="p-4 text-left text-sm font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="font-mono text-xs">
                          {log.admin_id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getActionColor(log.action_type)}>
                        <span className="mr-2">{getActionIcon(log.action_type)}</span>
                        {getActionLabel(log.action_type)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {log.target_table && (
                        <div>
                          <div className="font-medium">{log.target_table}</div>
                          {log.target_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {log.target_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {log.metadata?.reason && (
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {log.metadata.reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminAudit;
