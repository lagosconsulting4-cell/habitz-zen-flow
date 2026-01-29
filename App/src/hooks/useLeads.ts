import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Lead = Tables<"quiz_responses">;
export type LeadInteraction = Tables<"lead_interactions">;

export type LeadFilters = {
  follow_up_status?: string[];
  source?: string;
  tags?: string[];
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
};

export type LeadSortBy = {
  column: "created_at" | "name" | "email" | "follow_up_status";
  direction: "asc" | "desc";
};

interface UseLeadsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: LeadFilters;
  sortBy?: LeadSortBy;
}

export const useLeads = (params: UseLeadsParams = {}) => {
  const queryClient = useQueryClient();
  const {
    page = 1,
    pageSize = 25,
    search = "",
    filters = {},
    sortBy = { column: "created_at", direction: "desc" },
  } = params;

  // Query: Leads list with pagination and filters
  const leadsQuery = useQuery({
    queryKey: ["leads", page, pageSize, search, filters, sortBy],
    queryFn: async () => {
      let query = supabase.from("quiz_responses").select("*", { count: "exact" });

      // Global search (name, email, phone)
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Filters
      if (filters.follow_up_status && filters.follow_up_status.length > 0) {
        query = query.in("follow_up_status", filters.follow_up_status);
      }
      if (filters.source) {
        query = query.eq("source", filters.source);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }
      if (filters.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      // Sorting
      query = query.order(sortBy.column, { ascending: sortBy.direction === "asc" });

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        leads: data as Lead[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
    staleTime: 30_000, // 30 seconds
  });

  // Query: Lead interactions
  const useLeadInteractions = (leadId: string) =>
    useQuery({
      queryKey: ["lead-interactions", leadId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("lead_interactions")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as LeadInteraction[];
      },
      staleTime: 30_000,
      enabled: !!leadId,
    });

  // Query: Leads summary
  const summaryQuery = useQuery({
    queryKey: ["leads-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_summary")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // 1 minute
  });

  // Mutation: Update lead status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      leadId,
      status,
      note,
    }: {
      leadId: string;
      status: string;
      note?: string;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("update_lead_status", {
        p_admin_id: user.id,
        p_lead_id: leadId,
        p_new_status: status,
        p_note: note || null,
      });

      if (error) throw error;
      return data;
    },
    onMutate: async ({ leadId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["leads"] });

      // Snapshot previous value
      const previousLeads = queryClient.getQueryData(["leads", page, pageSize, search, filters, sortBy]);

      // Optimistically update cache
      queryClient.setQueryData(
        ["leads", page, pageSize, search, filters, sortBy],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            leads: old.leads.map((lead: Lead) =>
              lead.id === leadId ? { ...lead, follow_up_status: status } : lead
            ),
          };
        }
      );

      return { previousLeads };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(
          ["leads", page, pageSize, search, filters, sortBy],
          context.previousLeads
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-summary"] });
      queryClient.invalidateQueries({ queryKey: ["lead-interactions"] });
    },
  });

  // Mutation: Add note
  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("add_lead_note", {
        p_admin_id: user.id,
        p_lead_id: leadId,
        p_note: note,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-interactions"] });
    },
  });

  // Mutation: Add tag
  const addTagMutation = useMutation({
    mutationFn: async ({ leadId, tag }: { leadId: string; tag: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("add_lead_tag", {
        p_admin_id: user.id,
        p_lead_id: leadId,
        p_tag: tag,
      });

      if (error) throw error;
      return data;
    },
    onMutate: async ({ leadId, tag }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads", page, pageSize, search, filters, sortBy]);

      queryClient.setQueryData(
        ["leads", page, pageSize, search, filters, sortBy],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            leads: old.leads.map((lead: Lead) =>
              lead.id === leadId
                ? { ...lead, tags: [...(lead.tags || []), tag] }
                : lead
            ),
          };
        }
      );

      return { previousLeads };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(
          ["leads", page, pageSize, search, filters, sortBy],
          context.previousLeads
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-interactions"] });
    },
  });

  // Mutation: Remove tag
  const removeTagMutation = useMutation({
    mutationFn: async ({ leadId, tag }: { leadId: string; tag: string }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("remove_lead_tag", {
        p_admin_id: user.id,
        p_lead_id: leadId,
        p_tag: tag,
      });

      if (error) throw error;
      return data;
    },
    onMutate: async ({ leadId, tag }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads", page, pageSize, search, filters, sortBy]);

      queryClient.setQueryData(
        ["leads", page, pageSize, search, filters, sortBy],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            leads: old.leads.map((lead: Lead) =>
              lead.id === leadId
                ? { ...lead, tags: (lead.tags || []).filter((t) => t !== tag) }
                : lead
            ),
          };
        }
      );

      return { previousLeads };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(
          ["leads", page, pageSize, search, filters, sortBy],
          context.previousLeads
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-interactions"] });
    },
  });

  // Mutation: Mark as converted
  const markConvertedMutation = useMutation({
    mutationFn: async ({ leadId }: { leadId: string }) => {
      const { data, error } = await supabase
        .from("quiz_responses")
        .update({ converted_to_customer: true })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-summary"] });
    },
  });

  // Mutation: Bulk update status
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({
      leadIds,
      status,
    }: {
      leadIds: string[];
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("quiz_responses")
        .update({ follow_up_status: status })
        .in("id", leadIds)
        .select();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ leadIds, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousLeads = queryClient.getQueryData(["leads", page, pageSize, search, filters, sortBy]);

      queryClient.setQueryData(
        ["leads", page, pageSize, search, filters, sortBy],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            leads: old.leads.map((lead: Lead) =>
              leadIds.includes(lead.id)
                ? { ...lead, follow_up_status: status }
                : lead
            ),
          };
        }
      );

      return { previousLeads };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(
          ["leads", page, pageSize, search, filters, sortBy],
          context.previousLeads
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-summary"] });
    },
  });

  // Mutation: Add interaction
  const addInteractionMutation = useMutation({
    mutationFn: async ({
      leadId,
      type,
      content,
      metadata,
    }: {
      leadId: string;
      type: string;
      content?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("lead_interactions")
        .insert({
          lead_id: leadId,
          admin_user_id: user.id,
          type,
          content: content || null,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-interactions"] });
    },
  });

  return {
    // Queries
    leads: leadsQuery.data?.leads || [],
    totalCount: leadsQuery.data?.totalCount || 0,
    totalPages: leadsQuery.data?.totalPages || 0,
    currentPage: leadsQuery.data?.currentPage || 1,
    isLoading: leadsQuery.isLoading,
    isError: leadsQuery.isError,
    error: leadsQuery.error,
    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,

    // Mutations
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    addNote: addNoteMutation.mutate,
    addNoteAsync: addNoteMutation.mutateAsync,
    isAddingNote: addNoteMutation.isPending,

    addTag: addTagMutation.mutate,
    addTagAsync: addTagMutation.mutateAsync,
    isAddingTag: addTagMutation.isPending,

    removeTag: removeTagMutation.mutate,
    removeTagAsync: removeTagMutation.mutateAsync,
    isRemovingTag: removeTagMutation.isPending,

    markConverted: markConvertedMutation.mutate,
    markConvertedAsync: markConvertedMutation.mutateAsync,
    isMarkingConverted: markConvertedMutation.isPending,

    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,
    bulkUpdateStatusAsync: bulkUpdateStatusMutation.mutateAsync,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,

    addInteraction: addInteractionMutation.mutate,
    addInteractionAsync: addInteractionMutation.mutateAsync,
    isAddingInteraction: addInteractionMutation.isPending,

    // Helper hook
    useLeadInteractions,
  };
};
