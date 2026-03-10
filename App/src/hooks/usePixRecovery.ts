import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PixRecoveryLead = {
  id: string;
  source_table: "purchases" | "pending_purchases";
  email: string | null;
  name: string | null;
  phone: string | null;
  product_names: string | null;
  provider: string | null;
  payment_method: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  exported_at: string | null;
  urgency: "fresh" | "recent" | "aging" | "stale";
  product_label: string;
};

export type PixRecoveryFilters = {
  product?: "all" | "Bora App" | "Foquinha AI";
  urgency?: string;
  exported?: "all" | "exported" | "not_exported";
  date_from?: string;
  date_to?: string;
};

export type PixRecoverySortBy = {
  column: "created_at" | "email" | "amount_cents" | "product_label";
  direction: "asc" | "desc";
};

type PixRecoverySummary = {
  total_open: number;
  bora_open: number;
  foquinha_open: number;
  other_open: number;
  fresh_count: number;
  recent_count: number;
  aging_count: number;
  stale_count: number;
  already_exported: number;
  not_exported: number;
  total_amount_cents: number;
};

interface UsePixRecoveryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: PixRecoveryFilters;
  sortBy?: PixRecoverySortBy;
}

export const usePixRecovery = (params: UsePixRecoveryParams = {}) => {
  const queryClient = useQueryClient();
  const {
    page = 1,
    pageSize = 25,
    search = "",
    filters = {},
    sortBy = { column: "created_at", direction: "desc" },
  } = params;

  const leadsQuery = useQuery({
    queryKey: ["pix-recovery", page, pageSize, search, filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("admin_pix_recovery")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,name.ilike.%${search}%`
        );
      }

      if (filters.product && filters.product !== "all") {
        query = query.eq("product_label", filters.product);
      }

      if (filters.urgency) {
        query = query.eq("urgency", filters.urgency);
      }

      if (filters.exported === "exported") {
        query = query.not("exported_at", "is", null);
      } else if (filters.exported === "not_exported") {
        query = query.is("exported_at", null);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", `${filters.date_to}T23:59:59`);
      }

      query = query.order(sortBy.column, {
        ascending: sortBy.direction === "asc",
      });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        leads: (data || []) as PixRecoveryLead[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["pix-recovery-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_pix_recovery_summary")
        .select("*")
        .single();
      if (error) throw error;
      return data as PixRecoverySummary;
    },
    staleTime: 60_000,
  });

  const markExportedMutation = useMutation({
    mutationFn: async ({
      ids,
      sourceTables,
      campaignName,
    }: {
      ids: string[];
      sourceTables: string[];
      campaignName?: string;
    }) => {
      const { data, error } = await supabase.rpc("mark_pix_recovery_exported", {
        p_ids: ids,
        p_source_tables: sourceTables,
        p_campaign_name: campaignName || "manual_export",
      });
      if (error) throw error;
      return data as number;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pix-recovery"] });
      queryClient.invalidateQueries({ queryKey: ["pix-recovery-summary"] });
    },
  });

  const fetchAllForExport = async () => {
    let query = supabase.from("admin_pix_recovery").select("*");

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }
    if (filters.product && filters.product !== "all") {
      query = query.eq("product_label", filters.product);
    }
    if (filters.urgency) {
      query = query.eq("urgency", filters.urgency);
    }
    if (filters.exported === "exported") {
      query = query.not("exported_at", "is", null);
    } else if (filters.exported === "not_exported") {
      query = query.is("exported_at", null);
    }
    if (filters.date_from) {
      query = query.gte("created_at", filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte("created_at", `${filters.date_to}T23:59:59`);
    }

    query = query.order(sortBy.column, {
      ascending: sortBy.direction === "asc",
    });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PixRecoveryLead[];
  };

  return {
    leads: leadsQuery.data?.leads || [],
    totalCount: leadsQuery.data?.totalCount || 0,
    totalPages: leadsQuery.data?.totalPages || 0,
    currentPage: leadsQuery.data?.currentPage || 1,
    isLoading: leadsQuery.isLoading,
    isError: leadsQuery.isError,
    error: leadsQuery.error,

    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,

    markExported: markExportedMutation.mutateAsync,
    isMarkingExported: markExportedMutation.isPending,

    fetchAllForExport,
  };
};
