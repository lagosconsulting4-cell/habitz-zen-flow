import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton, AnalyticsSkeleton } from "@/components/ui/skeleton";
import { useLeads, type Lead, type LeadFilters } from "@/hooks/useLeads";
import { useLeadsAnalytics } from "@/hooks/useLeadsAnalytics";
import { useUnconvertedLeads, type UnconvertedLead, type UnconvertedLeadFilters } from "@/hooks/useUnconvertedLeads";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { LeadDetailSheet } from "@/components/admin/LeadDetailSheet";
import { LeadCard } from "@/components/admin/LeadCard";
import { MetricCard } from "@/components/admin/MetricCard";
import { LeadsFunnel } from "@/components/admin/LeadsFunnel";
import { LeadsDemographics } from "@/components/admin/LeadsDemographics";
import { LeadsUTMTable } from "@/components/admin/LeadsUTMTable";
import { LeadsTemporalChart } from "@/components/admin/LeadsTemporalChart";
import { LeadsHeatmap } from "@/components/admin/LeadsHeatmap";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { exportLeadsToCSV, exportSelectedLeads, exportUnconvertedLeadsToCSV } from "@/utils/csvExport";
import { Search, ChevronLeft, ChevronRight, Download, MoreHorizontal, Filter, TrendingUp, Users, Target, Zap, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Flame, ThermometerSun, Snowflake, UserX, Mail, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminLeads = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true }
  ]);

  // Map TanStack sorting to our sortBy format
  const sortBy = useMemo(() => {
    if (sorting.length === 0) {
      return { column: "created_at", direction: "desc" as const };
    }
    const sort = sorting[0];
    return {
      column: sort.id as "created_at" | "name" | "email" | "follow_up_status",
      direction: sort.desc ? ("desc" as const) : ("asc" as const),
    };
  }, [sorting]);

  const {
    leads,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    isError,
    error,
    summary,
    summaryLoading,
    bulkUpdateStatus,
    isBulkUpdating,
  } = useLeads({
    page,
    pageSize: 25,
    search,
    filters,
    sortBy,
  });

  // Analytics data
  const analytics = useLeadsAnalytics();

  // Campaign tab state
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignFilters, setCampaignFilters] = useState<UnconvertedLeadFilters>({ emailed: "new" });
  const [campaignRowSelection, setCampaignRowSelection] = useState<RowSelectionState>({});

  const campaign = useUnconvertedLeads({
    page: campaignPage,
    pageSize: 25,
    search: campaignSearch,
    filters: campaignFilters,
  });

  const campaignSelectedCount = Object.keys(campaignRowSelection).length;
  const campaignSelectedIds = Object.keys(campaignRowSelection).map(
    (index) => campaign.leads[parseInt(index)]?.id
  ).filter(Boolean);

  const handleCampaignExportFiltered = async () => {
    try {
      const allLeads = await campaign.fetchAllForExport();
      exportUnconvertedLeadsToCSV(
        allLeads,
        `campanha-leads-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      toast.success(`${allLeads.length} leads exportados`);
    } catch {
      toast.error("Erro ao exportar leads");
    }
  };

  const handleCampaignExportSelected = () => {
    const selected = campaign.leads.filter((_, i) => campaignRowSelection[i]);
    exportUnconvertedLeadsToCSV(
      selected,
      `campanha-selecionados-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    toast.success(`${selected.length} leads exportados`);
  };

  const handleMarkEmailed = async () => {
    try {
      const count = await campaign.markEmailed({ leadIds: campaignSelectedIds });
      toast.success(`${count} leads marcados como email enviado`);
      setCampaignRowSelection({});
    } catch {
      toast.error("Erro ao marcar leads");
    }
  };

  const temperatureBadge = (temp: string) => {
    switch (temp) {
      case "hot": return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">Hot</Badge>;
      case "warm": return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0">Warm</Badge>;
      case "cool": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">Cool</Badge>;
      case "cold": return <Badge variant="secondary">Cold</Badge>;
      default: return <Badge variant="outline">{temp}</Badge>;
    }
  };

  // TanStack Table columns
  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8"
            >
              Nome
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8"
            >
              Email
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: "Telefone",
        cell: ({ row }) => <div className="text-sm">{row.original.phone}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "follow_up_status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8"
            >
              Status
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => <LeadStatusBadge status={row.original.follow_up_status} />,
        enableSorting: true,
      },
      {
        accessorKey: "objective",
        header: "Objetivo",
        cell: ({ row }) => (
          <div className="text-sm capitalize">{row.original.objective || "-"}</div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8"
            >
              Data
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {format(new Date(row.original.created_at), "dd/MM/yyyy")}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "source",
        header: "Origem",
        cell: ({ row }) => <Badge variant="outline">{row.original.source}</Badge>,
      },
    ],
    []
  );

  // TanStack Table instance
  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    manualSorting: true, // Server-side sorting
  });

  const selectedCount = Object.keys(rowSelection).length;
  const selectedIds = Object.keys(rowSelection).map((index) => leads[parseInt(index)].id);

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  const handleExportAll = () => {
    exportLeadsToCSV(leads, `leads-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("Exportação iniciada");
  };

  const handleExportSelected = () => {
    exportSelectedLeads(
      leads,
      selectedIds,
      `leads-selecionados-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    toast.success(`${selectedCount} leads exportados`);
  };

  const handleBulkStatusChange = async (status: string) => {
    try {
      await bulkUpdateStatus(
        { leadIds: selectedIds, status },
        {
          onSuccess: () => {
            toast.success(`Status de ${selectedCount} leads atualizado`);
            setRowSelection({});
          },
          onError: () => {
            toast.error("Erro ao atualizar status");
          },
        }
      );
    } catch (error) {
      console.error("Error updating bulk status:", error);
    }
  };

  // Show error state if there's an error loading leads
  if (isError && error) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leads</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie e acompanhe todos os leads do quiz</p>
        </div>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Erro ao carregar leads</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error.message || "Ocorreu um erro ao carregar os dados. Tente novamente."}
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Leads</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gerencie e acompanhe todos os leads do quiz</p>
      </div>

      {/* KPI Cards */}
      {!summaryLoading && summary && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total de Leads</div>
            <div className="text-xl sm:text-2xl font-bold">{summary.total_leads}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Novos</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{summary.new_leads}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Convertidos</div>
            <div className="text-xl sm:text-2xl font-bold text-green-500">{summary.converted_leads}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Taxa de Conversão</div>
            <div className="text-xl sm:text-2xl font-bold">{summary.conversion_rate_percent}%</div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="campaign">Campanha</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="p-4 sm:p-6">
              {/* Toolbar */}
              <div className="flex flex-col gap-2 sm:gap-4 mb-4">
                {/* Row 1: Search */}
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Row 2: Filters and Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                  <Select
                    value={filters.follow_up_status?.[0] || "all"}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        follow_up_status: value === "all" ? undefined : [value],
                      });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="contactado">Contactado</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    {selectedCount > 0 ? (
                      <>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {selectedCount} selecionados
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isBulkUpdating} className="flex-1 sm:flex-initial">
                              <MoreHorizontal className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Ações em Massa</span>
                              <span className="sm:hidden">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBulkStatusChange("contactado")}>
                              Marcar como Contactado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkStatusChange("convertido")}>
                              Marcar como Convertido
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkStatusChange("perdido")}>
                              Marcar como Perdido
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportSelected}>
                              Exportar Selecionados
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleExportAll} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="rounded-md border p-4">
                  <TableSkeleton rows={10} columns={8} />
                </div>
              ) : isMobile ? (
                // Mobile: Card view
                <div className="space-y-3">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <LeadCard
                        key={row.id}
                        lead={row.original}
                        isSelected={row.getIsSelected()}
                        onSelect={(checked) => row.toggleSelected(!!checked)}
                        onClick={() => handleRowClick(row.original)}
                      />
                    ))
                  ) : (
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                      Nenhum lead encontrado.
                    </div>
                  )}
                </div>
              ) : (
                // Desktop: Table view
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={(e) => {
                            // Don't open detail if clicking checkbox
                            if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                              return;
                            }
                            handleRowClick(row.original);
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center">
                            Nenhum lead encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 sm:gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando <span className="font-medium">{(currentPage - 1) * 25 + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * 25, totalCount)}</span> de{" "}
                  <span className="font-medium">{totalCount}</span> leads
                </div>
                <div className="flex items-center justify-between sm:justify-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Anterior</span>
                  </Button>
                  <div className="text-xs sm:text-sm px-2">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="hidden sm:inline mr-2">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3 sm:space-y-4 lg:space-y-6">
          {analytics.funnel.isLoading ? (
            <AnalyticsSkeleton />
          ) : analytics.funnel.isError ? (
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="text-lg font-semibold">Erro ao carregar analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ocorreu um erro ao carregar os dados analíticos. Tente novamente.
                  </p>
                </div>
                <Button onClick={() => window.location.reload()}>
                  Recarregar Página
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard
              title="Taxa de Conversão"
              value={`${analytics.funnel.data?.conversion_rate || 0}%`}
              description="Leads convertidos em clientes"
              icon={<TrendingUp className="h-4 w-4" />}
              loading={analytics.funnel.isLoading}
            />
            <MetricCard
              title="Taxa de Contato"
              value={`${analytics.funnel.data?.contact_rate || 0}%`}
              description="Leads contactados"
              icon={<Users className="h-4 w-4" />}
              loading={analytics.funnel.isLoading}
            />
            <MetricCard
              title="Taxa de Conclusão"
              value={`${analytics.funnel.data?.completion_rate || 0}%`}
              description="Quiz completado"
              icon={<Target className="h-4 w-4" />}
              loading={analytics.funnel.isLoading}
            />
            <MetricCard
              title="Leads Ativos"
              value={analytics.funnel.data?.total_leads || 0}
              description="Total de leads no sistema"
              icon={<Zap className="h-4 w-4" />}
              loading={analytics.funnel.isLoading}
            />
          </div>

          {/* Conversion Funnel */}
          <LeadsFunnel data={analytics.funnel.data} loading={analytics.funnel.isLoading} />

          {/* Temporal Trends */}
          <LeadsTemporalChart
            dailyData={analytics.temporal.data}
            weeklyData={analytics.temporalWeekly.data}
            dailyLoading={analytics.temporal.isLoading}
            weeklyLoading={analytics.temporalWeekly.isLoading}
          />

          {/* Heatmap */}
          <LeadsHeatmap data={analytics.heatmap.data} loading={analytics.heatmap.isLoading} />

          {/* Demographics */}
          <LeadsDemographics
            ageData={analytics.byAge.data}
            professionData={analytics.byProfession.data}
            objectiveData={analytics.byObjective.data}
            financialData={analytics.byFinancialRange.data}
            genderData={analytics.byGender.data}
            ageLoading={analytics.byAge.isLoading}
            professionLoading={analytics.byProfession.isLoading}
            objectiveLoading={analytics.byObjective.isLoading}
            financialLoading={analytics.byFinancialRange.isLoading}
            genderLoading={analytics.byGender.isLoading}
          />

              {/* UTM Performance */}
              <LeadsUTMTable data={analytics.byUTM.data} loading={analytics.byUTM.isLoading} />
            </>
          )}
        </TabsContent>

        {/* Campaign Tab */}
        <TabsContent value="campaign" className="space-y-4">
          {/* Temperature Summary Cards */}
          {campaign.summaryLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : campaign.summary ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{campaign.summary.total_unconverted}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Não Convertidos</div>
              </div>
              <button
                className={`rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 text-center transition-all ${campaignFilters.lead_temperature === "hot" ? "ring-2 ring-red-500" : "hover:ring-1 hover:ring-red-300"}`}
                onClick={() => {
                  setCampaignFilters(f => ({ ...f, lead_temperature: f.lead_temperature === "hot" ? undefined : "hot" }));
                  setCampaignPage(1);
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{campaign.summary.hot_leads}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Hot (7 dias)</div>
              </button>
              <button
                className={`rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950 p-3 text-center transition-all ${campaignFilters.lead_temperature === "warm" ? "ring-2 ring-orange-500" : "hover:ring-1 hover:ring-orange-300"}`}
                onClick={() => {
                  setCampaignFilters(f => ({ ...f, lead_temperature: f.lead_temperature === "warm" ? undefined : "warm" }));
                  setCampaignPage(1);
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <ThermometerSun className="h-4 w-4 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{campaign.summary.warm_leads}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Warm (30 dias)</div>
              </button>
              <button
                className={`rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3 text-center transition-all ${campaignFilters.lead_temperature === "cool" ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300"}`}
                onClick={() => {
                  setCampaignFilters(f => ({ ...f, lead_temperature: f.lead_temperature === "cool" ? undefined : "cool" }));
                  setCampaignPage(1);
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <Snowflake className="h-4 w-4 text-blue-400" />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{campaign.summary.cool_leads}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Cool (90 dias)</div>
              </button>
              <button
                className={`rounded-lg border p-3 text-center transition-all ${campaignFilters.lead_temperature === "cold" ? "ring-2 ring-gray-500" : "hover:ring-1 hover:ring-gray-300"}`}
                onClick={() => {
                  setCampaignFilters(f => ({ ...f, lead_temperature: f.lead_temperature === "cold" ? undefined : "cold" }));
                  setCampaignPage(1);
                }}
              >
                <div className="text-2xl font-bold text-muted-foreground">{campaign.summary.cold_leads}</div>
                <div className="text-xs text-muted-foreground mt-1">Cold (90+ dias)</div>
              </button>
            </div>
          ) : null}

          {/* Campaign Table */}
          <Card>
            <div className="p-4 sm:p-6">
              {/* Toolbar */}
              <div className="flex flex-col gap-2 sm:gap-4 mb-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={campaignSearch}
                    onChange={(e) => {
                      setCampaignSearch(e.target.value);
                      setCampaignPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={campaignFilters.emailed || "all"}
                      onValueChange={(value) => {
                        setCampaignFilters(f => ({ ...f, emailed: value as "all" | "new" | "emailed" }));
                        setCampaignPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-auto">
                        <Mail className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Email" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="new">Novos (sem email)</SelectItem>
                        <SelectItem value="emailed">Já receberam email</SelectItem>
                      </SelectContent>
                    </Select>

                    {campaignFilters.lead_temperature && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          setCampaignFilters(f => ({ ...f, lead_temperature: undefined }));
                          setCampaignPage(1);
                        }}
                      >
                        {campaignFilters.lead_temperature} ✕
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {campaignSelectedCount > 0 ? (
                      <>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {campaignSelectedCount} selecionados
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={campaign.isMarkingEmailed}>
                              <MoreHorizontal className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleMarkEmailed}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Email Enviado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCampaignExportSelected}>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar Selecionados
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleCampaignExportFiltered} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Filtrados
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              {campaign.isLoading ? (
                <div className="rounded-md border p-4">
                  <TableSkeleton rows={10} columns={7} />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={campaign.leads.length > 0 && Object.keys(campaignRowSelection).length === campaign.leads.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const all: RowSelectionState = {};
                                campaign.leads.forEach((_, i) => { all[i] = true; });
                                setCampaignRowSelection(all);
                              } else {
                                setCampaignRowSelection({});
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        {!isMobile && <TableHead>Telefone</TableHead>}
                        {!isMobile && <TableHead>Objetivo</TableHead>}
                        <TableHead>Temperatura</TableHead>
                        {!isMobile && <TableHead>UTM</TableHead>}
                        <TableHead>Data Quiz</TableHead>
                        {!isMobile && <TableHead>Último Email</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.leads.length > 0 ? (
                        campaign.leads.map((lead, index) => (
                          <TableRow key={lead.id} data-state={campaignRowSelection[index] && "selected"}>
                            <TableCell>
                              <Checkbox
                                checked={!!campaignRowSelection[index]}
                                onCheckedChange={(checked) => {
                                  setCampaignRowSelection(prev => {
                                    const next = { ...prev };
                                    if (checked) { next[index] = true; } else { delete next[index]; }
                                    return next;
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                            {!isMobile && <TableCell className="text-sm">{lead.phone}</TableCell>}
                            {!isMobile && <TableCell className="text-sm capitalize">{lead.objective || "-"}</TableCell>}
                            <TableCell>{temperatureBadge(lead.lead_temperature)}</TableCell>
                            {!isMobile && <TableCell className="text-sm">{lead.utm_source || "-"}</TableCell>}
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(lead.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            {!isMobile && (
                              <TableCell className="text-sm text-muted-foreground">
                                {lead.last_campaign_sent_at
                                  ? format(new Date(lead.last_campaign_sent_at), "dd/MM/yyyy")
                                  : <span className="text-yellow-600 dark:text-yellow-400">Novo</span>
                                }
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isMobile ? 5 : 9} className="h-24 text-center">
                            Nenhum lead encontrado com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 sm:gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando <span className="font-medium">{campaign.totalCount > 0 ? (campaign.currentPage - 1) * 25 + 1 : 0}</span> a{" "}
                  <span className="font-medium">{Math.min(campaign.currentPage * 25, campaign.totalCount)}</span> de{" "}
                  <span className="font-medium">{campaign.totalCount}</span> leads
                </div>
                <div className="flex items-center justify-between sm:justify-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage(p => Math.max(1, p - 1))}
                    disabled={campaign.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Anterior</span>
                  </Button>
                  <div className="text-xs sm:text-sm px-2">
                    Página {campaign.currentPage} de {campaign.totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage(p => Math.min(campaign.totalPages, p + 1))}
                    disabled={campaign.currentPage === campaign.totalPages || campaign.totalPages === 0}
                  >
                    <span className="hidden sm:inline mr-2">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet lead={selectedLead} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default AdminLeads;
