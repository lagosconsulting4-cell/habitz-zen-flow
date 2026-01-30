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
import { Card } from "@/components/ui/card";
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
import { exportLeadsToCSV, exportSelectedLeads } from "@/utils/csvExport";
import { Search, ChevronLeft, ChevronRight, Download, MoreHorizontal, Filter, TrendingUp, Users, Target, Zap, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

        <TabsContent value="analytics" className="space-y-6">
          {analytics.funnel.isLoading ? (
            <AnalyticsSkeleton />
          ) : analytics.funnel.isError ? (
            <Card className="p-8">
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
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
      </Tabs>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet lead={selectedLead} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default AdminLeads;
