import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UnconvertedLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  objective: string | null;
  age_range: string | null;
  profession: string | null;
  financial_range: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  source: string | null;
  follow_up_status: string;
  created_at: string;
  last_campaign_sent_at: string | null;
  lead_temperature: string;
};

export type UnconvertedLeadFilters = {
  lead_temperature?: string;
  utm_source?: string;
  objective?: string;
  emailed?: "all" | "new" | "emailed"; // new = not yet emailed
};

export type UnconvertedSortBy = {
  column: "created_at" | "name" | "email";
  direction: "asc" | "desc";
};

type UnconvertedSummary = {
  total_unconverted: number;
  hot_leads: number;
  warm_leads: number;
  cool_leads: number;
  cold_leads: number;
};

interface UseUnconvertedLeadsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: UnconvertedLeadFilters;
  sortBy?: UnconvertedSortBy;
}

export const useUnconvertedLeads = (params: UseUnconvertedLeadsParams = {}) => {
  const queryClient = useQueryClient();
  const {
    page = 1,
    pageSize = 25,
    search = "",
    filters = {},
    sortBy = { column: "created_at", direction: "desc" },
  } = params;

  // Query: Paginated unconverted leads with filters
  const leadsQuery = useQuery({
    queryKey: ["unconverted-leads", page, pageSize, search, filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("admin_unconverted_leads")
        .select("*", { count: "exact" });

      // Search by name, email, phone
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      // Temperature filter
      if (filters.lead_temperature) {
        query = query.eq("lead_temperature", filters.lead_temperature);
      }

      // UTM source filter
      if (filters.utm_source) {
        query = query.eq("utm_source", filters.utm_source);
      }

      // Objective filter
      if (filters.objective) {
        query = query.eq("objective", filters.objective);
      }

      // Emailed filter
      if (filters.emailed === "new") {
        query = query.is("last_campaign_sent_at", null);
      } else if (filters.emailed === "emailed") {
        query = query.not("last_campaign_sent_at", "is", null);
      }

      // Sorting
      query = query.order(sortBy.column, {
        ascending: sortBy.direction === "asc",
      });

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        leads: (data || []) as UnconvertedLead[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30_000,
  });

  // Query: Summary counts by temperature
  const summaryQuery = useQuery({
    queryKey: ["unconverted-leads-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_unconverted_leads_summary")
        .select("*")
        .single();
      if (error) throw error;
      return data as UnconvertedSummary;
    },
    staleTime: 60_000,
  });

  // Mutation: Mark leads as emailed
  const markEmailedMutation = useMutation({
    mutationFn: async ({
      leadIds,
      campaignName,
    }: {
      leadIds: string[];
      campaignName?: string;
    }) => {
      const { data, error } = await supabase.rpc("mark_leads_emailed", {
        p_lead_ids: leadIds,
        p_campaign_name: campaignName || "manual_campaign",
      });
      if (error) throw error;
      return data as number;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["unconverted-leads"] });
      queryClient.invalidateQueries({
        queryKey: ["unconverted-leads-summary"],
      });
    },
  });

  // Helper: Export all leads matching current filters (no pagination limit)
  const fetchAllForExport = async () => {
    let query = supabase.from("admin_unconverted_leads").select("*");

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }
    if (filters.lead_temperature) {
      query = query.eq("lead_temperature", filters.lead_temperature);
    }
    if (filters.utm_source) {
      query = query.eq("utm_source", filters.utm_source);
    }
    if (filters.objective) {
      query = query.eq("objective", filters.objective);
    }
    if (filters.emailed === "new") {
      query = query.is("last_campaign_sent_at", null);
    } else if (filters.emailed === "emailed") {
      query = query.not("last_campaign_sent_at", "is", null);
    }

    query = query.order(sortBy.column, {
      ascending: sortBy.direction === "asc",
    });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as UnconvertedLead[];
  };

  return {
    // Leads list
    leads: leadsQuery.data?.leads || [],
    totalCount: leadsQuery.data?.totalCount || 0,
    totalPages: leadsQuery.data?.totalPages || 0,
    currentPage: leadsQuery.data?.currentPage || 1,
    isLoading: leadsQuery.isLoading,
    isError: leadsQuery.isError,
    error: leadsQuery.error,

    // Summary
    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,

    // Mutations
    markEmailed: markEmailedMutation.mutateAsync,
    isMarkingEmailed: markEmailedMutation.isPending,

    // Export helper
    fetchAllForExport,
  };
};
